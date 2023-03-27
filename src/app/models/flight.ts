import { transport } from "./transport";

export interface flight  {
    origin: string | null;
    destination: string | null;
    price: number | null;
    transport: transport | null;
}