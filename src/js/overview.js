import {
	isWithinInterval,
	isBefore,
	isToday,
	addDays,
	subDays,
} from "date-fns";

const overviewToday = {
	id: "todo-today", // Needs to be the same as the ID in template.html
	fn: isToday,
};

const overviewSeven = {
	id: "todo-seven",
	fn: isWithinSevenDays,
};

const overviewAll = {
	id: "todo-all",
	fn: isNotTrash,
};

const overviewTrash = {
	id: "todo-trash",
	fn: isTrash,
};

export const overviewList = [
	overviewToday,
	overviewSeven,
	overviewAll,
	overviewTrash,
];

// All dates after today (today excluded) are in Trash
export function isTrash(date) {
	return isBefore(date, subDays(new Date(), 1));
}

function isNotTrash(date) {
	return !isBefore(date, subDays(new Date(), 1));
}

// Today is included
function isWithinSevenDays(date) {
	return isWithinInterval(date, {
		start: subDays(new Date(), 1),
		end: addDays(new Date(), 7),
	});
}
