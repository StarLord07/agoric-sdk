// @ts-check

import { test } from '@agoric/zoe/tools/prepare-test-env-ava.js';
import '@agoric/zoe/exported.js';
import { AmountMath, AssetKind, makeIssuerKit } from '@agoric/ertp';
import { makeRatio } from '@agoric/zoe/src/contractSupport/index.js';

import { makeHandle } from '@agoric/zoe/src/makeHandle.js';
import { Far } from '@agoric/marshal';
import { buildParamManager } from '../../src/paramManager.js';
import { makeParamChangePositions } from '../../src/governParam.js';
import {
  makeGovernedString,
  makeGovernedAmount,
  makeGovernedNat,
  makeGovernedRatio,
  makeGovernedBrand,
  makeGovernedInstance,
  makeGovernedInstallation,
  makeGovernedUnknown,
} from '../../src/paramMakers.js';

const BASIS_POINTS = 10_000n;

test('params one Nat', async t => {
  const numberKey = 'Number';
  const numberDescription = makeGovernedNat(numberKey, 13n);
  const { getParam, updateNumber } = buildParamManager([numberDescription]);
  t.deepEqual(getParam(numberKey), numberDescription);
  updateNumber(42n);
  t.deepEqual(getParam(numberKey).value, 42n);

  t.throws(
    () => updateNumber(18.1),
    {
      message: '18.1 must be a bigint',
    },
    'value should be a nat',
  );
  t.throws(
    () => updateNumber(13),
    {
      message: '13 must be a bigint',
    },
    'must be bigint',
  );
});

test('params one String', async t => {
  const stringKey = 'String';
  const stringDescription = makeGovernedString(stringKey, 'foo');
  const { getParam, updateString } = buildParamManager([stringDescription]);
  t.deepEqual(getParam(stringKey), stringDescription);
  updateString('bar');
  t.deepEqual(getParam(stringKey).value, 'bar');

  t.throws(
    () => updateString(18.1),
    {
      message: '18.1 must be a string',
    },
    'value should be a string',
  );
});

test('params one Amount', async t => {
  const amountKey = 'Amount';
  const { brand } = makeIssuerKit('roses', AssetKind.SET);
  const emptyAmount = AmountMath.makeEmpty(brand);
  const amountDescription = makeGovernedAmount(amountKey, emptyAmount);
  const { getParam, updateAmount } = buildParamManager([amountDescription]);
  t.deepEqual(getParam(amountKey), amountDescription);
  updateAmount(AmountMath.make(brand, harden([13])));
  t.deepEqual(getParam(amountKey).value, AmountMath.make(brand, harden([13])));

  t.throws(
    () => updateAmount(18.1),
    {
      message: '"brand" "[undefined]" must be a remotable, not "undefined"',
    },
    'value should be a amount',
  );
});

test('params one BigInt', async t => {
  const bigintKey = 'Bigint';
  const bigIntDescription = makeGovernedNat(bigintKey, 314159n);
  const { getParam, updateBigint } = buildParamManager([bigIntDescription]);
  t.deepEqual(getParam(bigintKey), bigIntDescription);
  updateBigint(271828182845904523536n);
  t.deepEqual(getParam(bigintKey).value, 271828182845904523536n);

  t.throws(
    () => updateBigint(18.1),
    {
      message: '18.1 must be a bigint',
    },
    'value should be a bigint',
  );
  t.throws(
    () => updateBigint(-1000n),
    {
      message: '-1000 is negative',
    },
    'NAT params must be positive',
  );
});

test('params one ratio', async t => {
  const ratioKey = 'Ratio';
  const { brand } = makeIssuerKit('roses', AssetKind.SET);
  const ratioDescription = makeGovernedRatio(ratioKey, makeRatio(7n, brand));

  const { getParam, getParams, updateRatio } = buildParamManager([
    ratioDescription,
  ]);
  // t.deepEqual(getParams()[ratioKey], ratioDescription);
  t.deepEqual(getParam(ratioKey), ratioDescription);
  updateRatio(makeRatio(701n, brand, BASIS_POINTS));
  t.deepEqual(
    getParams()[ratioKey].value,
    makeRatio(701n, brand, BASIS_POINTS),
  );

  t.throws(
    () => updateRatio(18.1),
    {
      message: '"ratio" 18.1 must be a pass-by-copy record, not "number"',
    },
    'value should be a ratio',
  );
});

test('params one brand', async t => {
  const brandKey = 'Brand';
  const { brand: roseBrand } = makeIssuerKit('roses', AssetKind.SET);
  const { brand: thornBrand } = makeIssuerKit('thorns');
  const brandDescription = makeGovernedBrand(brandKey, roseBrand);
  const { getParam, updateBrand } = buildParamManager([brandDescription]);
  t.deepEqual(getParam(brandKey), brandDescription);
  updateBrand(thornBrand);
  t.deepEqual(getParam(brandKey).value, thornBrand);

  t.throws(
    () => updateBrand(18.1),
    {
      message: 'value for "Brand" must be a brand, was 18.1',
    },
    'value should be a brand',
  );
});

test('params one unknown', async t => {
  const stuffKey = 'Stuff';
  const { brand: stiltonBrand } = makeIssuerKit('stilton', AssetKind.SET);
  const stuffDescription = makeGovernedUnknown(stuffKey, stiltonBrand);
  const { getParam, updateStuff } = buildParamManager([stuffDescription]);
  t.deepEqual(getParam(stuffKey), stuffDescription);
  updateStuff(18.1);
  t.deepEqual(getParam(stuffKey).value, 18.1);
});

test('params one instance', async t => {
  const instanceKey = 'Instance';
  // this is sufficient for the current type check. When we add
  // isInstance() (#3344), we'll need to make a mockZoe.
  const instanceHandle = makeHandle('Instance');
  const instanceDescription = makeGovernedInstance(instanceKey, instanceHandle);
  const { getParam, updateInstance } = buildParamManager([instanceDescription]);
  t.deepEqual(getParam(instanceKey), instanceDescription);
  t.throws(
    () => updateInstance(18.1),
    {
      message: 'value for "Instance" must be an Instance, was 18.1',
    },
    'value should be an Instance',
  );
  const handle2 = makeHandle('another Instance');
  updateInstance(handle2);
  t.deepEqual(getParam(instanceKey).value, handle2);
});

test('params one installation', async t => {
  const installationKey = 'Installation';
  // this is sufficient for the current type check. When we add
  // isInstallation() (#3344), we'll need to make a mockZoe.
  const installationHandle = Far('fake Installation', {
    getBundle: () => ({ obfuscated: 42 }),
  });
  const installationDescription = makeGovernedInstallation(
    installationKey,
    installationHandle,
  );
  const { getParam, updateInstallation } = buildParamManager([
    installationDescription,
  ]);
  t.deepEqual(getParam(installationKey), installationDescription);
  t.throws(
    () => updateInstallation(18.1),
    {
      message: 'value for "Installation" must be an Installation, was 18.1',
    },
    'value should be an installation',
  );
  const handle2 = Far('another fake Installation', {
    getBundle: () => ({ condensed: '() => {})' }),
  });
  updateInstallation(handle2);
  t.deepEqual(getParam(installationKey).value, handle2);
});

test('params duplicate entry', async t => {
  const stuffKey = 'Stuff';
  const { brand: stiltonBrand } = makeIssuerKit('stilton', AssetKind.SET);
  t.throws(
    () =>
      buildParamManager([
        makeGovernedNat(stuffKey, 37n),
        makeGovernedUnknown(stuffKey, stiltonBrand),
      ]),
    {
      message: `each parameter name must be unique: "Stuff" duplicated`,
    },
  );
});

test('params unrecognized type', async t => {
  const stuffKey = 'Stuff';
  const stuffDescription = {
    name: stuffKey,
    value: 'It was the best of times, it was the worst of times',
    type: 'quote',
  };
  // @ts-ignore  illegal value for testing
  t.throws(() => buildParamManager([stuffDescription]), {
    message: 'unrecognized type "quote"',
  });
});

test('params multiple values', t => {
  const stuffKey = 'Stuff';
  const natKey = 'Nat';
  const { brand: parmesanBrand } = makeIssuerKit('parmesan', AssetKind.SET);
  const cheeseDescription = makeGovernedUnknown(stuffKey, parmesanBrand);
  const constantDescription = makeGovernedNat(
    natKey,
    602214076000000000000000n,
  );
  const { getParams, getParam, updateNat, updateStuff } = buildParamManager([
    cheeseDescription,
    constantDescription,
  ]);
  t.deepEqual(getParam(stuffKey), cheeseDescription);
  updateStuff(18.1);
  const floatDescription = makeGovernedUnknown(stuffKey, 18.1);
  t.deepEqual(getParam(stuffKey), floatDescription);
  t.deepEqual(getParam(natKey), constantDescription);
  t.deepEqual(getParams(), {
    Nat: constantDescription,
    Stuff: floatDescription,
  });
  updateNat(299792458n);
  t.deepEqual(getParam(natKey).value, 299792458n);
});

const positive = (name, val) => {
  return { changeParam: name, proposedValue: val };
};

const negative = name => {
  return { noChange: name };
};

test('positions amount', t => {
  const amountSpec = { parameterName: 'amount', key: 'something' };
  const { brand } = makeIssuerKit('roses', AssetKind.SET);
  const amount = AmountMath.makeEmpty(brand);

  const positions = makeParamChangePositions(amountSpec, amount);
  t.deepEqual(positions.positive, positive(amountSpec, amount));
  t.deepEqual(positions.negative, negative(amountSpec));
  t.notDeepEqual(
    positions.positive,
    positive(AmountMath.make(brand, harden([1]))),
  );
});

test('positions brand', t => {
  const brandSpec = { parameterName: 'brand', key: 'params' };
  const { brand: roseBrand } = makeIssuerKit('roses', AssetKind.SET);
  const { brand: thornBrand } = makeIssuerKit('thorns', AssetKind.SET);

  const positions = makeParamChangePositions(brandSpec, roseBrand);
  t.deepEqual(positions.positive, positive(brandSpec, roseBrand));
  t.deepEqual(positions.negative, negative(brandSpec));
  t.not(positions.positive, positive(brandSpec, thornBrand));
});

test('positions instance', t => {
  const instanceSpec = { parameterName: 'instance', key: 'something' };
  // this is sufficient for the current type check. When we add
  // isInstallation() (#3344), we'll need to make a mockZoe.
  const instanceHandle = makeHandle('Instance');

  const positions = makeParamChangePositions(instanceSpec, instanceHandle);
  t.deepEqual(positions.positive, positive(instanceSpec, instanceHandle));
  t.deepEqual(positions.negative, negative(instanceSpec));
  t.not(positions.positive, positive(instanceSpec, makeHandle('Instance')));
});

test('positions Installation', t => {
  const installationSpec = { parameterName: 'installation', key: 'something' };
  // this is sufficient for the current type check. When we add
  // isInstallation() (#3344), we'll need to make a mockZoe.
  const installationHandle = makeHandle('Installation');

  const positions = makeParamChangePositions(
    installationSpec,
    installationHandle,
  );
  t.deepEqual(
    positions.positive,
    positive(installationSpec, installationHandle),
  );
  t.deepEqual(positions.negative, negative(installationSpec));
  t.not(
    positions.positive,
    positive(installationSpec, makeHandle('Installation')),
  );
});

test('positions Nat', t => {
  const natSpec = { parameterName: 'nat', key: 'something' };
  const nat = 3n;

  const positions = makeParamChangePositions(natSpec, nat);
  t.deepEqual(positions.positive, positive(natSpec, nat));
  t.deepEqual(positions.negative, negative(natSpec));
  t.notDeepEqual(positions.positive, positive(natSpec, 4n));
});

test('positions Ratio', t => {
  const ratioSpec = { parameterName: 'ratio', key: 'something' };
  const { brand } = makeIssuerKit('elo', AssetKind.NAT);
  const ratio = makeRatio(2500n, brand, 2400n);

  const positions = makeParamChangePositions(ratioSpec, ratio);
  t.deepEqual(positions.positive, positive(ratioSpec, ratio));
  t.deepEqual(positions.negative, negative(ratioSpec));
  t.notDeepEqual(
    positions.positive,
    positive(ratioSpec, makeRatio(2500n, brand, 2200n)),
  );
});

test('positions string', t => {
  const stringSpec = { parameterName: 'string', key: 'something' };
  const string = 'When in the course';

  const positions = makeParamChangePositions(stringSpec, string);
  t.deepEqual(positions.positive, positive(stringSpec, string));
  t.deepEqual(positions.negative, negative(stringSpec));
  t.notDeepEqual(
    positions.positive,
    positive(stringSpec, 'We hold these truths'),
  );
});
