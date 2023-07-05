const exp_num = /^[0-9]+$/;
const exp_id = /^[A-Za-z]{1}[A-Za-z0-9]{5,11}$/;
const exp_str = /^[A-Z0-9a-z가-힣\s]+$/;
const exp_pwd =
  /^.*(?=^.{8,15}$)(?=.*\d)(?=.*[a-zA-Z])(?=.*[!@#$%^&+=]).*$/; //8~15자리
const exp_url = /(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/

function validate(strArray: Array<string>, exp: RegExp) {
  return strArray.reduce((p, c) => p && exp.test(c), true);
}

export function validate_id(...str: Array<string>): boolean {
  return validate(str, exp_id);
}

export function validate_pwd(...str: Array<string>): boolean {
  return validate(str, exp_pwd);
}

export function validate_str(...str: Array<string>): boolean {
  return validate(str, exp_str);
}

export function validate_number(...str: Array<string>): boolean {
  return validate(str, exp_num);
}

export function validate_url(...str: Array<string>): boolean {
    return validate(str, exp_url);
}
