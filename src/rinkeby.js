const {encodeCallScript} = require('@aragon/test-helpers/evmScript');
const {encodeActCall, execAppMethod} = require('mathew-aragon-toolkit');
const ethers = require('ethers');
const utils = require('ethers/utils');
const {keccak256} = require('web3-utils');
const {RLP} = utils;
const provider = ethers.getDefaultProvider('rinkeby');
const BN = utils.bigNumberify;
const env = 'rinkeby';


// DAO addresses
const dao = 'YOUR_DAO_ADDRESS';
const acl = 'YOUR_DAO_ACL_ADDRESS';
const agent = 'YOUR_DAO_AGENT_ADDRESS';
const tokenManager = 'YOU_DAO_TOKEN_MANAGER_ADDRESS';
const voting = 'YOUR_DAO_VOTING_ADDRESS';
const ANY_ADDRESS = '0xffffffffffffffffffffffffffffffffffffffff';
const ETH_ADDRESS = '0x0000000000000000000000000000000000000000';


// new apps ***Note these addresses are different on Rinkeby and Mainnet***
const redemptionsAppId = '0x743bd419d5c9061290b181b19e114f36e9cc9ddb42b4e54fc811edb22eb85e9d';
const redemptionsBase = '0xe47d2A5D3319E30D1078DB181966707d8a58dE98';
let redemptions;


// signatures
const newAppInstanceSignature = 'newAppInstance(bytes32,address,bytes,bool)';
const createPermissionSignature = 'createPermission(address,address,bytes32,address)';
const grantPermissionSignature = 'grantPermission(address,address,bytes32)';
const redemptionsInitSignature = 'initialize(address,address,address[])';


// functions for counterfactual addresses
async function buildNonceForAddress(_address, _index, _provider) {
    const txCount = await _provider.getTransactionCount(_address);
    return `0x${(txCount + _index).toString(16)}`;
}

async function calculateNewProxyAddress(_daoAddress, _nonce) {
    const rlpEncoded = RLP.encode([_daoAddress, _nonce]);
    const contractAddressLong = keccak256(rlpEncoded);
    const contractAddress = `0x${contractAddressLong.substr(-40)}`;

    return contractAddress;
}

async function firstTx() {
    // counterfactual addresses
    const nonce = await buildNonceForAddress(dao, 0, provider);
    redemptions = await calculateNewProxyAddress(dao, nonce);
    

    // app initialisation payloads
    const redemptionsInitPayload = await encodeActCall(redemptionsInitSignature, [
        agent,
        tokenManager,
        [ETH_ADDRESS]
    ]);

    // package first transaction
    const calldatum = await Promise.all([
        encodeActCall(newAppInstanceSignature, [
            redemptionsAppId,
            redemptionsBase,
            redemptionsInitPayload,
            true,
        ]),
        encodeActCall(createPermissionSignature, [
            ANY_ADDRESS,
            redemptions,
            keccak256('REDEEM_ROLE'),
            voting,
        ]),
        encodeActCall(createPermissionSignature, [
            voting,
            redemptions,
            keccak256('ADD_TOKEN_ROLE'),
            voting,
        ]),
        encodeActCall(createPermissionSignature, [
            voting,
            redemptions,
            keccak256('REMOVE_TOKEN_ROLE'),
            voting,
        ]),
        encodeActCall(grantPermissionSignature, [
            redemptions,
            agent,
            keccak256('TRANSFER_ROLE'),
        ]),
        encodeActCall(grantPermissionSignature, [
            redemptions,
            tokenManager,
            keccak256('BURN_ROLE'),
        ])
    ]);

    const actions = [
        {
            to: dao,
            calldata: calldatum[0],
        },
        {
            to: acl,
            calldata: calldatum[1],
        },
        {
            to: acl,
            calldata: calldatum[2],
        },
        {
            to: acl,
            calldata: calldatum[3],
        },
        {
            to: acl,
            calldata: calldatum[4],
        },
    ];
    const script = encodeCallScript(actions);

    await execAppMethod(
        dao,
        voting,
        'newVote',
        [
            script,
            `
            Installing Redemptions
            `,
        ],
        () => {},
        env,
    );
}

const main = async () => {
    console.log('Generating vote');
    await firstTx();
};

main()
    .then(() => {
        console.log('Script finished.');
        process.exit();
    })
    .catch((e) => {
        console.error(e);
        process.exit();
    });
