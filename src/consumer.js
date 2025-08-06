require('dotenv').config();
const amqp = require('amqplib');
const { PlaylistsService } = require('./services/PlaylistsService');
const MailService = require('./services/MailService');
const Listener = require('./listener');

const init = async () => {
  const playlistsService = new PlaylistsService();
  const mailService = new MailService();
  const listener = new Listener(playlistsService, mailService);

  const connection = await amqp.connect(process.env.RABBITMQ_SERVER);

  const channel = await connection.createChannel();

  await channel.assertQueue('export:playlist', {
    durable: true,
  });

  channel.consume('export:playlist', listener.listen, { noAck: true });

};

init();
