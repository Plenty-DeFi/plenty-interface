const axios = require('axios');

export const getTokensPrice = async () => {
    try {
        const response = await axios.get('https://api.teztools.io/token/prices');
        return {
            success : true,
            response
        }
    }
    catch(error)
    {
        return {
            success : false,
            response : {}
        }
    }
}

const getLpPriceFromDex = async (identifier , dexAddress) => {
    try {
        const response = await axios.get(`https://mainnet.tezster.tech/chains/main/blocks/head/context/contracts/${dexAddress}/storage`)
        //let token_pool = response.data.args[1].args[0].args[3];
        console.log(response.data);
        let tez_pool = parseInt(response.data.args[1].args[0].args[1].args[2].int);
        console.log({tez_pool});
        let total_Supply = parseInt(response.data.args[1].args[1].args[0].args[0].int);
        console.log({total_Supply});
        let lpPriceInXtz = (tez_pool*2)/total_Supply;
        return {
            success : true,
            identifier,
            lpPriceInXtz,
            tez_pool,
            total_Supply,
            dexAddress
        }
    }   
    catch(error)
    {
        console.log(error);
        return {
            
            success : false,
            identifier,
            lpPriceInXtz : 0,
        }
    }
}

export const getLpPriceInXtz = async () => {
    try {
        let promises = [];
        //let dexAddresses = ['KT1X1LgNkQShpF9nRLYw3Dgdy4qp38MX617z','KT1J3wTYb4xk5BsSBkg6ML55bX1xq7desS34'];
        // for(let address in dexAddresses)
        // {
        //     //promises.push(axios.get(`https://mainnet.tezster.tech/chains/main/blocks/head/context/contracts/${address}/storage`))
        //     promises.push(getLpPriceFromDex())
        // }
        promises.push(getLpPriceFromDex('PLENTY-XTZ' , 'KT1X1LgNkQShpF9nRLYw3Dgdy4qp38MX617z'));
        promises.push(getLpPriceFromDex('KALAM-XTZ' , 'KT1J3wTYb4xk5BsSBkg6ML55bX1xq7desS34'));
        const response = await Promise.all(promises);
        return {
            success : true,
            response
        }

    }
    catch(error)
    {
        return {
            success : false,
            response : {}
        }
    }
}
