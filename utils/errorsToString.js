const errorsToString = (errors) => {
  let res = errors[0].msg;
  for (let i = 1; i < errors.length; i++) {
    if (i == errors.length - 1) {
      res = res + " and " + errors[errors.length - 1].msg;
    } else {
      res = res + ", " + errors[i].msg;
    }
  }

  return res;
};

module.exports = errorsToString;
