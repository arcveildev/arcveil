import subprocess, re, json, sys
MAXGAP=0.32; LEAD=0.08; TAIL=0.12; TEMPO=1.18
def silences(f):
    out = subprocess.run(["ffmpeg","-i",f,"-af","silencedetect=n=-35dB:d=0.2","-f","null","-"],capture_output=True,text=True).stderr
    starts=[float(x) for x in re.findall(r"silence_start: ([0-9.]+)",out)]
    ends=[float(x) for x in re.findall(r"silence_end: ([0-9.]+)",out)]
    dur=float(subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",f],capture_output=True,text=True).stdout)
    return list(zip(starts,ends+[dur]*(len(starts)-len(ends)))), dur
res={}
for i in range(1,9):
    f=f"vo{i}.mp3"; sil,dur=silences(f)
    # speech segments between silences
    segs=[]; cur=0.0
    for s,e in sil:
        if s>cur: segs.append((cur,s))
        cur=e
    if cur<dur: segs.append((cur,dur))
    # drop tiny pre-speech blips shorter than 0.2s at the very start
    segs=[(a,b) for a,b in segs if b-a>0.2 or a>0]
    # build filter: trim each seg, join with gaps capped
    parts=[]; 
    for k,(a,b) in enumerate(segs):
        a2=max(0,a-LEAD); b2=min(dur,b+TAIL)
        parts.append(f"[0:a]atrim={a2:.3f}:{b2:.3f},asetpts=PTS-STARTPTS[s{k}]")
        if k<len(segs)-1:
            gap=min(MAXGAP, segs[k+1][0]-b)
            parts.append(f"anullsrc=r=48000:cl=mono,atrim=0:{max(gap,0.05):.3f}[g{k}]")
    chain="".join(f"[s{k}][g{k}]" if k<len(segs)-1 else f"[s{k}]" for k in range(len(segs)))
    n=2*len(segs)-1
    fc=";".join(parts)+f";{chain}concat=n={n}:v=0:a=1,atempo={TEMPO}[out]"
    subprocess.run(["ffmpeg","-v","error","-y","-i",f,"-filter_complex",fc,"-map","[out]","-ar","48000","-ac","1",f"t{i}.wav"],check=True)
    d=float(subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",f"t{i}.wav"],capture_output=True,text=True).stdout)
    res[i]=round(d,2); print(i, "segs",len(segs), "->", round(d,2))
print("total", round(sum(res.values()),2)); json.dump(res,open("durs.json","w"))
