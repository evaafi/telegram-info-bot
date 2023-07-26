import { beginCell, Contract, Address } from 'ton';
import { TonClient } from "ton";
import { getHttpEndpoint } from "@orbs-network/ton-access";

export function bufferToBigInt(buffer: any, start = 0, end = buffer.length) {
    const bufferAsHexString = buffer.slice(start, end).toString("hex");
    return BigInt(`0x${bufferAsHexString}`);
}

export class Minter implements Contract {
    constructor(readonly address: Address) { }
    async getWalletAddress(provider: any, address: Address) {
        const param = {
            type: 'slice',
            cell: beginCell().storeAddress(address).endCell()
        } as any;
        const { stack } = await provider.get("get_wallet_address", [param]);
        return stack.readAddress();
    }
    async getBalance(provider: any) {
        const { stack } = await provider.get("get_wallet_data", []);
        return stack;
    }
}

export const tonClient = async () => {
    let endpoint = '';
    endpoint = await getHttpEndpoint({ network: "testnet" });
    return new TonClient({
        endpoint
    });
}
