const EXACT = {
  'Нешто тргна наопаку. Обидете се повторно.': 'Something went wrong. Please try again.',
  'Погрешна е-пошта или лозинка': 'Wrong email or password',
  'Веќе постои профил со оваа е-пошта': 'An account with this email already exists',
  'Внесете име на компанијата': 'Enter the company name',
  'Е-поштата не е потврдена. Ви испративме код.': 'Your email is not verified. We sent you a code.',
  'Кодот е погрешен или истечен.': 'The code is wrong or has expired.',
  'Кодот истече. Побарајте нов код.': 'The code has expired. Request a new one.',
  'Премногу погрешни обиди. Побарајте нов код.': 'Too many wrong attempts. Request a new code.',
  'Погрешен код. Побарајте нов код.': 'Wrong code. Request a new one.',
  'Почекајте една минута пред да побарате нов код.': 'Wait a minute before requesting a new code.',
  'Не успеавме да ја испратиме е-поштата. Обидете се повторно за една минута.': 'We couldn’t send the email. Try again in a minute.',
  'Оваа е-пошта ја користи друг профил': 'This email is used by another account',
  'Огласот е затворен': 'This job is closed',
  'Веќе аплициравте на овој оглас': 'You already applied for this job',
  'Внесете име и е-пошта': 'Enter your name and email',
  'Напишете барем една реченица во мотивационото писмо': 'Write at least one sentence in your cover letter',
  'CV-то мора да биде PDF, DOC или DOCX': 'The CV must be a PDF, DOC or DOCX file',
  'Датотеката не може да се зачува': 'The file could not be saved',
  'Датотеката е поголема од 5 MB': 'The file is larger than 5 MB',
  'Овој оглас не е ваш': 'This job does not belong to you',
  'Оваа апликација не е за ваш оглас': 'This application is not for one of your jobs',
  'Платата „од“ не може да биде поголема од платата „до“': 'The “from” salary cannot be greater than the “to” salary',
  'Немате пристап': 'You don’t have access',
  'Немате пристап до овој дел': 'You don’t have access to this section',
  'Најавете се за да продолжите': 'Log in to continue',
  'Невалидни податоци': 'Invalid data',
  'Внесете е-пошта': 'Enter your email',
  'Невалидна е-пошта': 'Invalid email address',
  'Внесете лозинка': 'Enter your password',
  'Внесете име и презиме': 'Enter your full name',
  'Лозинката мора да има најмалку 6 знаци': 'The password must have at least 6 characters',
  'Изберете тип на профил': 'Choose an account type',
  'Внесете наслов': 'Enter a title',
  'Внесете компанија': 'Enter a company',
  'Изберете локација': 'Choose a location',
  'Изберете тип на работа': 'Choose an employment type',
  'Изберете категорија': 'Choose a category',
  'Внесете плата од': 'Enter the minimum salary',
  'Внесете плата до': 'Enter the maximum salary',
  'Внесете опис': 'Enter a description',
  'Внесете го кодот': 'Enter the code',
  'Кодот има 6 цифри': 'The code has 6 digits',
  'Изберете статус': 'Choose a status'
};

const NOT_FOUND = { 'Корисникот': 'User', 'Огласот': 'Job', 'Апликацијата': 'Application', 'CV-то': 'CV' };

export function translateServerMessage(message, lang) {
  if (lang !== 'en' || !message) return message;
  if (EXACT[message]) return EXACT[message];

  const left = message.match(/^Погрешен код\. Ви остануваат уште (\d+) обиди\.$/);
  if (left) return `Wrong code. ${left[1]} attempts left.`;

  const nf = message.match(/^(.+) не е пронајден$/);
  if (nf) return `${NOT_FOUND[nf[1]] || 'Item'} not found`;

  return message;
}
