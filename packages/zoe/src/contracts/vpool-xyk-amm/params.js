// @ts-check

import { makeParamManagerBuilder } from '@agoric/governance/src/paramGovernance/paramManager.js';
import { CONTRACT_ELECTORATE } from '@agoric/governance/src/paramGovernance/governParam.js';
import {
  makeGovernedNat,
  makeGovernedInvitation,
} from '@agoric/governance/src/paramGovernance/paramMakers.js';

export const POOL_FEE_KEY = 'PoolFee';
export const PROTOCOL_FEE_KEY = 'ProtocolFee';

const POOL_FEE_BP = 24n;
const PROTOCOL_FEE_BP = 6n;

/** @type {(poolFeeBP: bigint, protocolFeeBP: bigint) => ParamManagerFull} */
const makeParamManager = async (poolFeeBP, protocolFeeBP) => {
  const builder = makeParamManagerBuilder()
    .addNat(POOL_FEE_KEY, poolFeeBP)
    .addNat(PROTOCOL_FEE_KEY, protocolFeeBP);

  await builder.addInvitation(CONTRACT_ELECTORATE, poserInvitation);
  return builder.build();
};

const makeAmmParams = (
  electorateInvitationAmount,
  protocolFeeBP,
  poolFeeBP,
) => {
  return harden({
    [POOL_FEE_KEY]: makeGovernedNat(poolFeeBP),
    [PROTOCOL_FEE_KEY]: makeGovernedNat(protocolFeeBP),
    [CONTRACT_ELECTORATE]: makeGovernedInvitation(electorateInvitationAmount),
  });
};

harden(makeAmmParams);
harden(makeParamManager);

export { makeAmmParams, makeParamManager };
