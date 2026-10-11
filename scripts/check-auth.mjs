import dgram from 'node:dgram';import{randomBytes}from'node:crypto';
for(const family of ['udp4','udp6']){
 const socket=dgram.createSocket(family),transaction=randomBytes(12),packet=Buffer.alloc(28);
 packet.writeUInt16BE(3,0);packet.writeUInt16BE(8,2);packet.writeUInt32BE(0x2112a442,4);transaction.copy(packet,8);packet.writeUInt16BE(0x19,20);packet.writeUInt16BE(4,22);packet[24]=17;
 let timer;
 try{const result=await new Promise((resolve,reject)=>{timer=setTimeout(()=>reject(Error('TURN challenge timeout')),5000);socket.once('error',reject);socket.once('message',data=>{if(data.readUInt16BE(0)!==0x113||!data.subarray(8,20).equals(transaction))return reject(Error('unexpected TURN response'));let status;for(let offset=20;offset+4<=data.length;){const type=data.readUInt16BE(offset),size=data.readUInt16BE(offset+2);if(type===9&&size>=4)status=(data[offset+6]&7)*100+data[offset+7];offset+=4+((size+3)&~3);}resolve(status);});socket.send(packet,3478,'relay.battlefronteternal.com');});if(result!==401)throw Error('unauthenticated allocation was not challenged');console.log(family,'unauthenticated allocation rejected: 401');}finally{clearTimeout(timer);socket.close();}
}
