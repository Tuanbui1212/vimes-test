export function formatCurrency(amount: number): string {
  if (isNaN(amount)) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
}

export function numberToWords(amount: number): string {
  if (!amount || isNaN(amount) || amount === 0) return 'Không đồng';

  const defaultNumbers = ' không một hai ba bốn năm sáu bảy tám chín';
  const units = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ'];

  const readThreeDigits = (threeDigits: string): string => {
    let num = parseInt(threeDigits, 10);
    if (num === 0) return '';

    let hundred = Math.floor(num / 100);
    let ten = Math.floor((num % 100) / 10);
    let one = num % 10;
    let result = '';

    if (hundred > 0 || threeDigits.length === 3) {
      result += ' ' + defaultNumbers.split(' ')[hundred + 1] + ' trăm';
    }

    if (ten > 1) {
      result += ' ' + defaultNumbers.split(' ')[ten + 1] + ' mươi';
      if (one === 1) result += ' mốt';
      else if (one === 5) result += ' lăm';
      else if (one > 0) result += ' ' + defaultNumbers.split(' ')[one + 1];
    } else if (ten === 1) {
      result += ' mười';
      if (one === 5) result += ' lăm';
      else if (one > 0) result += ' ' + defaultNumbers.split(' ')[one + 1];
    } else if (hundred > 0 && one > 0) {
      result += ' lẻ ' + defaultNumbers.split(' ')[one + 1];
    } else if (one > 0) {
      result += ' ' + defaultNumbers.split(' ')[one + 1];
    }

    return result;
  };

  let str = Math.round(amount).toString();
  let groups: string[] = [];

  while (str.length > 0) {
    groups.unshift(str.slice(-3));
    str = str.slice(0, -3);
  }

  let result = '';
  for (let i = 0; i < groups.length; i++) {
    let groupNum = parseInt(groups[i], 10);
    if (groupNum > 0) {
      let threeWords = readThreeDigits(groups[i]);
      let unitIndex = groups.length - 1 - i;
      result += threeWords + ' ' + units[unitIndex] + ' ';
    }
  }

  result = result.trim().replace(/\s+/g, ' ');
  if (!result) return 'Không đồng';
  return (result.charAt(0).toUpperCase() + result.slice(1) + ' đồng chẵn.').trim();
}
