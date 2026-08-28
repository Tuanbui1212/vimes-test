export function formatCurrency(amount: number): string {
  if (isNaN(amount)) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
}

const DIGITS = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];

function readGroup3Digits(group: string, readZeroHundred: boolean): string {
  const num = parseInt(group, 10);
  const hundred = Math.floor(num / 100);
  const ten = Math.floor((num % 100) / 10);
  const unit = num % 10;
  let res = '';

  if (readZeroHundred || hundred > 0) {
    res += ` ${DIGITS[hundred]} trăm`;
  }

  if (ten > 1) {
    res += ` ${DIGITS[ten]} mươi`;
    if (unit === 1) res += ' mốt';
    else if (unit === 4) res += ' tư';
    else if (unit === 5) res += ' lăm';
    else if (unit > 0) res += ` ${DIGITS[unit]}`;
  } else if (ten === 1) {
    res += ' mười';
    if (unit === 5) res += ' lăm';
    else if (unit > 0) res += ` ${DIGITS[unit]}`;
  } else if (ten === 0 && (readZeroHundred || hundred > 0) && unit > 0) {
    res += ` lẻ ${DIGITS[unit]}`;
  } else if (ten === 0 && !readZeroHundred && hundred === 0 && unit > 0) {
    res += ` ${DIGITS[unit]}`;
  }

  return res.trim();
}

export function numberToWords(amount: number): string {
  if (isNaN(amount) || amount === 0) return 'Không đồng';

  const absAmount = Math.abs(Math.round(amount));
  let str = absAmount.toString();
  const groups: string[] = [];

  while (str.length > 0) {
    groups.unshift(str.slice(-3));
    str = str.slice(0, -3);
  }

  const scaleUnits = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ'];
  let result = '';

  for (let i = 0; i < groups.length; i++) {
    const groupNum = parseInt(groups[i], 10);
    if (groupNum > 0) {
      const readZeroHundred = i > 0;
      const groupText = readGroup3Digits(groups[i], readZeroHundred);
      const unitIndex = groups.length - 1 - i;
      const scale = scaleUnits[unitIndex] ? ` ${scaleUnits[unitIndex]}` : '';
      result += ` ${groupText}${scale}`;
    }
  }

  result = result.trim().replace(/\s+/g, ' ');
  if (!result) return 'Không đồng';

  return result.charAt(0).toUpperCase() + result.slice(1) + ' đồng.';
}

