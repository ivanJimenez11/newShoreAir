import { flight } from "./flight";

export interface journey{
    origin: string;
    destination: string;
    price: number | null;
    flight: flight[] | [];
}