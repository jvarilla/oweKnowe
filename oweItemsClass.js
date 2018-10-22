/*Joseph Varilla
6/2/18
OweKnowe
An App to keep track of loans-*/
//Handles owe Items

const numDaysByMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; //num of days by month in order

function OweItem(item) {//takes json object as parameter
  this.insertSpaces =  function(str) {//replaces hyphens from json text to spaces
      if (isNaN(Date.parse(str))) {//do not convert dates in string form
        returnStr =  str.replace(/-/g, ' ');
        return returnStr;
      }
      return str;
    };
  this.isLender =  item.isLender;
  this.otherPartyName = this.insertSpaces(item.otherPartyName);
  this.startDate = new Date(item.startDate);
  this.printStartDate = `${this.startDate.getMonth() + 1}/${this.startDate.getDate()}/${this.startDate.getFullYear()}`;
  this.dueDate = new Date(item.dueDate);
  this.printDueDate =`${this.dueDate.getMonth() + 1}/${this.dueDate.getDate()}/${this.dueDate.getFullYear()}`;
  this.hasInterest = item.hasInterest;
  this.interestRate = item.interest.rate;
  this.timeAccrued = item.interest.timeAccrued;
  this.isCompounded = item.interest.isCompounded;
  this.collateral = this.insertSpaces(item.collateral);
  this.principal =item.principal;
  this.toUSD = function(num) {//converts num to USD
    return `$${num.toFixed(2)}`;
  };

  this.daysLeftUntilDue =  Math.floor((this.dueDate - Date.now()) / 1000 / 60 / 60 / 24);
  this.dspInterestStr = function (){
    if (this.hasInterest){
      if(this.isCompounded) {
        return `${this.interestRate * 100}%
        compounded every ${this.timeAccrued}`;
      }
      return `${this.interestRate * 100}%
      accrues every ${this.timeAccrued} (NOT compounded)`;
    }
    return `0% does not accrue`;
  };
  this.getTimeElapsed = function() {/*number of time units (months, days, years)
    that have elapsed between start and endDates*/
    var today = new Date(Date.now())
    switch (this.timeAccrued) {
      case "day":
        return  (today - this.startDate) / 1000 / 60 / 60 / 24 //Calculates days between dates
        break;
      case "week":
        return  (today - this.startDate) / 1000 / 60 / 60/ 24 / 7 //Calculates weeks between dates
        break;
      case "month" :
        var timeUnitsPassed = (today.getMonth() + 1 + (today.getFullYear() * 12)) - (this.startDate.getMonth() + 1 + (this.startDate.getFullYear() * 12)) - 1
        if (today.getDate() < this.startDate.getDate()) {
          timeUnitsPassed += 1 //if a full month has fully elapsed  count the last month of difference
        }
        else if(today.getDate() >= numDaysByMonth[today.getMonth()]) {
          /*in the case of january to february if the loan was
          made on Jan 31, there is no 31 of February so if the month has
          reached its end the interest should accrue even if does not reach the
          31st day b/c the month is over*/
          timeUnitsPassed = timeUnitsPassed += 1
        }
        return timeUnitsPassed
        break;
      default:
        console.error("Invalid compound option");
        return 0;
    }
  };
  this.getCurrentTotal = function(){//Principal + interest
    var timeElapsed = this.getTimeElapsed();
    if (this.isCompounded) {
      var compoundedRecord = this.principal; //used for compounding upon running total of compounded principal
      for (var timeElapsedIdx = 0; timeElapsedIdx < timeElapsed; timeElapsedIdx++) {//does not count the zeroeth elapse so stop before time elapsed
        compoundedRecord = compoundedRecord + (this.interestRate * compoundedRecord); //compounds interest
      }
      return compoundedRecord; //returns compounded interest total
    }
    return (timeElapsed * this.interestRate * this.principal) + this.principal;
  };

  this.currentTotal = this.getCurrentTotal();  //Calculate Simple Interest

  this.interestAccrued = this.currentTotal - this.principal;
  this.generateSummaryStr = function() {
    var owedToFromStr = this.isLender ? "Owed From: " : "Owed To: ";
    return `<h2>Loan Summary:</h2>${owedToFromStr} ${this.otherPartyName}<br/>
    Loan Due Date: ${this.printDueDate}<br/>
    Loan Start Date: ${this.printStartDate} <br/>
    Days Left Until Due: ${this.daysLeftUntilDue} <br/>
    Interest Summary: ${this.dspInterestStr()} <br/>
    Current Total: ${this.toUSD(this.currentTotal)} <br/>
    Original Principal: ${this.toUSD(this.principal)} <br/>
    Interest Accrued: ${this.toUSD(this.interestAccrued)}`;
  };
  this.summaryStr = this.generateSummaryStr();
}
