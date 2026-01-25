import { Request, Response } from "express";

export async function pingCheck(_req: Request, res: Response) {
    try {
        return res.status(200).json({
            message: "Ping check OK",
        });
    } catch (error) {
        console.log("Error from ping controller: ", error);
        throw error;
    }
}
