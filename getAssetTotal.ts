import { Address, TupleBuilder } from "ton";
import { Minter, bufferToBigInt, tonClient } from "./utils";

export enum Token {
    TON,
    USDT,
    USDC,
    BTC,
    ETH,
    TOS,
}

type TokenMapType = {
    [key in Token]: {
        ticker: string;
        address?: Address;
        tokenAddress?: string;
        decimal: number;
    }
}

export const TokenMap: TokenMapType = {
    [Token.TON]: {
        ticker: 'TON',
        address: Address.parse(process.env.TON_JETTON_ADDRESS!),
        decimal: Math.pow(10, 9),
    },
    [Token.USDT]: {
        ticker: 'USDT',
        tokenAddress: process.env.USDT_EVAA_ADDRESS,
        decimal: Math.pow(10, 6),
    },
    [Token.USDC]: {
        ticker: 'USDC',
        tokenAddress: process.env.USDC_EVAA_ADDRESS,
        decimal: Math.pow(10, 6),
    },
    [Token.BTC]: {
        ticker: 'BTC',
        tokenAddress: process.env.BTC_EVAA_ADDRESS,
        decimal: Math.pow(10, 8),
    },
    [Token.ETH]: {
        ticker: 'ETH',
        tokenAddress: process.env.ETH_EVAA_ADDRESS,
        decimal: Math.pow(10, 8),
    },
    [Token.TOS]: {
        ticker: 'TOS',
        address: Address.parse('0:0000'),
        decimal: Math.pow(10, 6),
    }
};

async function initTokens() {
    for await (const tokenRawKey of Object.keys(TokenMap)) {
        const tokenKey = tokenRawKey as unknown as Token; // force cast to enum
        const token = TokenMap[tokenKey];

        if (typeof token.tokenAddress === 'string') {
            const contract = new Minter(Address.parse(token.tokenAddress));
            const masterAddress = Address.parse(process.env.MASTER_EVAA_ADDRESS!)
            const address = await (await tonClient()).open(contract).getWalletAddress(masterAddress) as Address;
            
            TokenMap[tokenKey].address = address;
        }
    }
}
initTokens();

export async function getAssetTotals() {
    const result = [];

    for await (const tokenRawKey of Object.keys(TokenMap)) {
        const tokenKey = tokenRawKey as unknown as Token; // force cast to enum
        const token = TokenMap[tokenKey];

        if (token.address) {
            const args = new TupleBuilder();
            args.writeNumber(bufferToBigInt(token.address.hash));
            let total_supply = BigInt(0);
            let total_borrow = BigInt(0);
            try {
                const res = await (await tonClient()).runMethod(
                    Address.parse(process.env.MASTER_EVAA_ADDRESS!),
                    'getAssetTotals',
                    args.build(),
                );
                total_supply = BigInt(res.stack.readNumber());
                total_borrow = BigInt(res.stack.readNumber());
    
            } catch {
                console.info(`${token?.address.toString()} not found`)
            }
    
            console.log('total supply: ', token.address.toString(), (total_supply))
            console.log('total borrow: ', token.address.toString(), (total_borrow))
            
            result.push({
                ticker: token.ticker,
                totalSupply: (Number(total_supply) / token.decimal).toFixed(2),
                totalBorrow: (Number(total_borrow) / token.decimal).toFixed(2)
            });
        }
    }

    return result;

}