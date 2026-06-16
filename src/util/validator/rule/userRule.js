export const userNo = (val) => {
  const regex = /^[A-Za-z0-9]{4,20}$/;

  if (!val) {
    return "아이디 확인은 필수입니다";
  }

  if (!regex.test(val)) {
    return "아이디 양식이 올바르지 않습니다.";
  }

  return "";
};

export const password = (val) => {
  const regex = /^[0-9a-zA-Z!@#$%^&*()]{8,20}$/;

  if (!val) {
    return "비밀번호는 필수입니다.";
  }

  if (!regex.test(val)) {
    return "비밀번호 양식이 올바르지 않습니다.";
  }

  return "";
};
