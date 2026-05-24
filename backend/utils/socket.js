let io = null;

const setIO = (socketIO) => {
  io = socketIO;
};

const getIO = () => io;

const emitToUser = (userId, event, data) => {
  if (io && userId) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

module.exports = { setIO, getIO, emitToUser };
