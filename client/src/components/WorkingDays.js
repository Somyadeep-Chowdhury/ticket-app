// import React from 'react'

function WorkingDays(startDate, endDate, key) {
    var s, e, adjust;

    if (startDate < endDate) {
        s = startDate;
        e = endDate;
    } else {
        s = endDate;
        e = startDate;
    }
    var diffDays = Math.floor((e - s) / 86400000);
    var weeksBetween = Math.floor(diffDays / 7);
    // console.log(weeksBetween, "before")
    if (weeksBetween === 0 && s.getDate() === e.getDate()) {
        weeksBetween = 0
        // console.log("iffffff", weeksBetween, weeksBetween === 0 && s.getDate() === e.getDate())
    }
    else if (weeksBetween && s.getDate() !== e.getDate() && s.getDay() === e.getDay()) {
        weeksBetween = weeksBetween + 1
        // console.log("else first", weeksBetween)
    }
    // else if (weeksBetween === weeksBetween && s.getDate() !== e.getDate() && s.getDay() === e.getDay() && key === "firsttat") {
    //     weeksBetween = weeksBetween + 1
    //     // console.log("else first", weeksBetween)
    // }
    // else if (weeksBetween === weeksBetween && s.getDate() !== e.getDate() && s.getDay() === e.getDay() && key === "secondDate") {
    //     weeksBetween = weeksBetween
    //     // console.log("else second", weeksBetween)
    // }
    // else {
    //     weeksBetween = weeksBetween
    // }
    if (s.getDay() === e.getDay() && s.getDate() === e.getDate()) {
        adjust = 0;
    } else if (s.getDay() === 0 && e.getDay() === 6) {
        adjust = 5;
    } else if (s.getDay() === 6 && e.getDay() === 0) {
        adjust = 0;
    } else if (e.getDay() === 6 || e.getDay() === 0) {
        adjust = 5 - s.getDay();
    } else if (s.getDay() === 0 || s.getDay() === 6) {
        adjust = e.getDay();
    } else if (e.getDay() > s.getDay()) {
        adjust = e.getDay() - s.getDay();
    }
    else if (s.getDay() === e.getDay()) {
        adjust = 0;
    } else {
        adjust = 5 + e.getDay() - s.getDay();
    }
    return (weeksBetween * 5) + adjust;
}
export default WorkingDays;
  // calculateWorkingDays(startDate, endDate) {
    //     if (startDate < endDate) {
    //         var s = startDate;
    //         var e = endDate;
    //     } else {
    //         var s = endDate;
    //         var e = startDate;
    //     }
    //     var diffDays = Math.floor((e - s) / 86400000);
    //     var weeksBetween = Math.floor(diffDays / 7);
    //     if (s.getDay() == e.getDay()) {
    //         var adjust = 0;
    //     } else if (s.getDay() == 0 && e.getDay() == 6) {
    //         var adjust = 5;
    //     } else if (s.getDay() == 6 && e.getDay() == 0) {
    //         var adjust = 0;
    //     } else if (e.getDay() == 6 || e.getDay() == 0) {
    //         var adjust = 5 - s.getDay();
    //     } else if (s.getDay() == 0 || s.getDay() == 6) {
    //         var adjust = e.getDay();
    //     } else if (e.getDay() > s.getDay()) {
    //         var adjust = e.getDay() - s.getDay();
    //     } else {
    //         var adjust = 5 + e.getDay() - s.getDay();
    //     }
    //     return (weeksBetween * 5) + adjust;
    // }
//Jismi 
    // calculateWorkingDays(today, date, newtats) {
    //     console.log(today,"today")
    //     console.log(date,"last date")
    //     var weekendDays = 0, weekDays = 0;
    //     var dayMilliseconds = 1000 * 60 * 60 * 24;
    //     while (today <= date) {
    //         var day = today.getDay();
    //         if (day == 0 || day == 6) {
    //             weekendDays++;
    //         } else {
    //             weekDays++;
    //         }

    //         today = new Date(+today + dayMilliseconds);
    //     }
    //     console.log(weekDays, "eeek dayyyyfghjnm")
    //     if (newtats === "newtat") {
    //         this.setState({ newtat: weekDays })
    //     }
    //     else {
    //         this.setState({ tat: weekDays })
    //     }
    // }