import enGB from 'date-fns/locale/en-GB';
import formatRelative from 'date-fns/formatRelative';

// https://date-fns.org/docs/I18n-Contribution-Guide#formatrelative
// https://github.com/date-fns/date-fns/blob/master/src/locale/en-US/_lib/formatRelative/index.js
// https://github.com/date-fns/date-fns/issues/1218
// https://stackoverflow.com/questions/47244216/how-to-customize-date-fnss-formatrelative
const formatRelativeLocale = {
    lastWeek: "'Last' eeee",
    yesterday: "'Yesterday'",
    today: "'Today'",
    tomorrow: "'Tomorrow'",
    nextWeek: "'Next' eeee",
    other: 'MM.dd.yyyy',
};

const locale = {
    ...enGB,
    formatRelative: (token) => formatRelativeLocale[token],
};

// is formatRelative + distanceToNow from date-fns without the time
export function formatRelativeToNow(date)
{
    return (formatRelative(date, new Date() , { locale }));
}