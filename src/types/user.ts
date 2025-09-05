// types/user.ts
export interface UserResponseDTO {
    userId: number;
    name: string;
    username: string;
    description: string;
    image?: string;
    background?: string;
    createdDate: string;
    verified?: boolean;
  }
  
  export interface UserParticipateLinkerDTO {
    linkerId: number;
    name: string;
    participatedDate: string;
    memo: string;
    linkerState: string;
  }
  