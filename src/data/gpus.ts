export type GpuOffer = {
  id: string;
  name: string;
  vendor: "NVIDIA" | "AMD";
  status: "Available" | "Limited";
  config: string;
  pricePerHour: number;
  spotPerHour?: number;
  vram: string;
  ram: string;
  vcpu: string;
};

export const SINGLE_NODE_GPUS: readonly GpuOffer[] = [
  { id: "h200-a", name: "H200", vendor: "NVIDIA", status: "Available", config: "x2 · x1", pricePerHour: 1.99, vram: "80 GB VRAM", ram: "184 GB RAM", vcpu: "32 vCPUs" },
  { id: "h200-b", name: "H200", vendor: "NVIDIA", status: "Available", config: "x2 · x1", pricePerHour: 1.8, vram: "80 GB VRAM", ram: "184 GB RAM", vcpu: "32 vCPUs" },
  { id: "b300", name: "B300", vendor: "NVIDIA", status: "Available", config: "x8 · x1", pricePerHour: 4.99, vram: "288 GB VRAM", ram: "480 GB RAM", vcpu: "48 vCPUs" },
  { id: "b200", name: "B200", vendor: "NVIDIA", status: "Available", config: "x8 · x1", pricePerHour: 3.49, vram: "192 GB VRAM", ram: "384 GB RAM", vcpu: "32 vCPUs" },
  { id: "h200-c", name: "H200", vendor: "NVIDIA", status: "Available", config: "x2 · x1", pricePerHour: 3.14, vram: "141 GB VRAM", ram: "182 GB RAM", vcpu: "44 vCPUs" },
  { id: "h100", name: "H100", vendor: "NVIDIA", status: "Available", config: "x2 · x1", pricePerHour: 2.43, spotPerHour: 0.94, vram: "80 GB VRAM", ram: "185 GB RAM", vcpu: "32 vCPUs" },
  { id: "gh200", name: "GH200", vendor: "NVIDIA", status: "Available", config: "x1", pricePerHour: 3.14, vram: "96 GB VRAM", ram: "480 GB RAM", vcpu: "72 vCPUs" },
  { id: "rtx6000", name: "RTX Pro 6000", vendor: "NVIDIA", status: "Available", config: "x2 · x1", pricePerHour: 1.74, vram: "96 GB VRAM", ram: "128 GB RAM", vcpu: "24 vCPUs" },
  { id: "a100", name: "A100", vendor: "NVIDIA", status: "Available", config: "x2 · x1", pricePerHour: 1.29, vram: "80 GB VRAM", ram: "120 GB RAM", vcpu: "16 vCPUs" },
  { id: "a40", name: "A40", vendor: "NVIDIA", status: "Limited", config: "x1", pricePerHour: 0.47, vram: "48 GB VRAM", ram: "96 GB RAM", vcpu: "12 vCPUs" },
];

export const MULTI_NODE_GPUS: readonly GpuOffer[] = [
  { id: "b300-cluster", name: "B300 NVL72", vendor: "NVIDIA", status: "Available", config: "x72 · x144", pricePerHour: 5.0, vram: "288 GB VRAM", ram: "2 TB RAM", vcpu: "192 vCPUs" },
  { id: "b200-cluster", name: "B200 SXM6", vendor: "NVIDIA", status: "Available", config: "x64 · x128", pricePerHour: 3.6, vram: "192 GB VRAM", ram: "1.5 TB RAM", vcpu: "128 vCPUs" },
  { id: "h200-cluster", name: "H200 SXM5", vendor: "NVIDIA", status: "Available", config: "x64 · x256", pricePerHour: 2.75, vram: "141 GB VRAM", ram: "1.5 TB RAM", vcpu: "128 vCPUs" },
  { id: "h100-cluster", name: "H100 SXM5", vendor: "NVIDIA", status: "Available", config: "x64 · x512", pricePerHour: 2.1, vram: "80 GB VRAM", ram: "1 TB RAM", vcpu: "96 vCPUs" },
];

export const RESERVED_SKUS = [
  { id: "b300-sxm6", label: "B300 SXM6", pricePerHour: 5.0 },
  { id: "b200-sxm6", label: "B200 SXM6", pricePerHour: 3.6 },
  { id: "h200-sxm5", label: "H200 SXM5", pricePerHour: 2.75 },
  { id: "h100-sxm5", label: "H100 SXM5", pricePerHour: 2.1 },
] as const;
