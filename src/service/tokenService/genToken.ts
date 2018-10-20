let genToken = () =>
  Math.floor(10e8 * Math.random())
    .toString(16)
    .slice(0, 8);

export default genToken;
