import { flight } from "./flight";

export interface journey{
    origin: string;
    destination: string;
    price: number;
    flight: flight[] | [];
}