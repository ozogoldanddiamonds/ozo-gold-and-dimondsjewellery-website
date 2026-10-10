
export type JewelleryType =
  | 'RING'
  | 'NECKLACE'
  | 'EARRINGS'
  | 'BANGLES'
  | 'BRACELET'
  | 'CHAIN'
  | 'PENDANT'
  | 'OTHER';

export type DesignType =
  | 'REFERENCE_DESIGN'
  | 'NEW_DESIGN';

export type MetalType =
  | 'GOLD'
  | 'GOLD_DIAMOND'
  | 'SILVER'
  | 'PLATINUM';

export type GoldPurity =
  | '18K'
  | '22K'
  | '24K';

export type GoldColor =
  | 'YELLOW'
  | 'WHITE'
  | 'ROSE';

export type StoneType =
  | 'NONE'
  | 'DIAMOND'
  | 'GEMSTONE';

export type DiamondType =
  | 'NATURAL'
  | 'LAB_GROWN';

export type ContactMethod =
  | 'WHATSAPP'
  | 'PHONE'
  | 'EMAIL';

export type CustomDesignStatus =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'QUOTATION_SENT'
  | 'APPROVED'
  | 'IN_PRODUCTION'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED';

// Uploaded image details from Cloudinary
export interface CustomDesignImage {
  url: string;
  publicId?: string | null;
}

// Create request payload
export interface CreateCustomDesignRequest {
  jewelleryType: JewelleryType;
  designType: DesignType;
  description: string;

  metalType: MetalType;
  goldPurity?: GoldPurity | null;
  goldColor?: GoldColor | null;

  stoneType: StoneType;
  diamondType?: DiamondType | null;
  gemstoneType?: string | null;

  goldWeight: number;
  requiredDate?: string | null;
  quantity: number;

  preferredContactMethod: ContactMethod;
  additionalNotes?: string;

  referenceImages?: File[];
}

// Custom design request returned by backend
export interface CustomDesignRequest {
  _id: string;
  requestNumber: string;
  customer: string;

  jewelleryType: JewelleryType;
  designType: DesignType;
  description: string;

  metalType: MetalType;
  goldPurity?: GoldPurity | null;
  goldColor?: GoldColor | null;

  stoneType: StoneType;
  diamondType?: DiamondType | null;
  gemstoneType?: string | null;

  goldWeight: number;
  requiredDate?: string | null;
  quantity: number;

  preferredContactMethod: ContactMethod;
  additionalNotes?: string;

  referenceImages: CustomDesignImage[];

  status: CustomDesignStatus;
  adminNotes?: string;
  quotedPrice?: number | null;
  estimatedDeliveryDate?: string | null;

  createdAt: string;
  updatedAt: string;
}

// API response for a single request
export interface CustomDesignResponse {
  success: boolean;
  message?: string;
  data: CustomDesignRequest;
}

// API response for request list
export interface CustomDesignListResponse {
  success: boolean;
  count: number;
  data: CustomDesignRequest[];
}
