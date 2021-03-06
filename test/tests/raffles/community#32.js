/* global describe it before */

require('../../general.js');

const db = require('../../general.js').db;
const message = require('../../general.js').message;
const _ = require('lodash');
const {getOwnerAsSender} = require('../../../dest/helpers/commons/getOwnerAsSender');

const { getRepository } = require('typeorm');
const { User } = require('../../../dest/database/entity/user');
const { Raffle } = require('../../../dest/database/entity/raffle');

const raffles = (require('../../../dest/systems/raffles')).default;

const assert = require('assert');

const max = Math.floor(Number.MAX_SAFE_INTEGER / 10000000);

const owner = { username: '__broadcaster__', userId: Number(_.random(999999, false)) };
const testuser = { username: 'testuser', userId: Number(_.random(999999, false)) };
const testuser2 = { username: 'testuser2', userId: Number(_.random(999999, false)) };

describe('/t/raffle-owner-can-join-raffle-more-then-1-time/32', () => {
  before(async () => {
    await db.cleanup();
    await message.prepare();
  });

  it('create normal raffle', async () => {
    raffles.open({ sender: owner, parameters: '!winme' });
    await message.isSentRaw('Raffle is running (0 entries). To enter type "!winme". Raffle is opened for everyone.', { username: 'bot' });
  });

  it('loop through owner participations', async () => {
    for (let i = 0; i < 100; i++) {
      const a = await raffles.participate({ sender: getOwnerAsSender(), message: `!winme` });
      assert(a);
    }
  });

  it('expecting only one participator', async () => {
    const raffle = await getRepository(Raffle).findOne({
      relations: ['participants'],
      where: { winner: null, isClosed: false },
    });
    assert(raffle.participants.length === 1)
  });
});
