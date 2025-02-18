/* 정규식 체크를 하기 위한 함수들 */

const exp:RegExp = /^[0-9]+$/;
const exp_id:RegExp = /^[A-Za-z]{1}[A-Za-z0-9]{5,11}$/;         
const exp_name:RegExp = /^[A-Z0-9a-z가-힣\s]+$/
const exp_pwd:RegExp = /^.*(?=^.{8,15}$)(?=.*\d)(?=.*[a-zA-Z])(?=.*[!@#$%^&+=]).*$/;  //8~15자리 


export function check_id(object:string):boolean {
    return exp_id.test(object);
}

export function check_pwd(object:string):boolean {
    return exp_pwd.test(object);
}

export function check_name(object:string):boolean {
    return exp_name.test(object);
}

export function check_number(object:string):boolean {
    return exp.test(object);
}

