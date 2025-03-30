import { isWithinInterval, isToday, addDays, subDays } from "date-fns";

const overviewToday = {
	id: "todo-today", // needs to be the same as the ID in template.html
	fn: isToday
};

const overviewSeven = {
	id: "todo-seven",
	fn: isNextSevenDays
}

const overviewAll = {
	id: "todo-all",
	fn: () => 1
}

const overviewTrash = {
	id: "todo-trash",
	fn: isTrash
}

export const overviewList = [overviewToday, overviewSeven, overviewAll, overviewTrash];

function isTrash() {
	return (1);
}

function isNextSevenDays(date) {
	return (isWithinInterval(date, {
		start: subDays(new Date(), 1),
		end: addDays(new Date(), 7)
	}));
}
