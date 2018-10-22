/*
Sample item debt Item
{
owedTo: true/false,
owedFrom: true/false,
otherPartyName: string,
startDate: Date object,
dueDate: Date object,
hasInterest: true/false,
interest:
  {rate: decimal value,
   timeCompounded: |day|week| 30 day month
  },
collateral: Long Text,
principal: 4.00
}
*/

//const numDaysByMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; //num of days by month in order
$(function(){
  /*for(var i = 0; i < 100; i++) {
    $("body").append("<h1>Hi</h1><br>");
  }*/
  var myData = data;
  console.log(myData);
  $("#modalClose").click(function(){
    $(".modal").css("display", "none");
  })

  /*Utility functions*/
  var clear = function(elementName){//Should include . or # for element
    $(elementName).html("");
  }

  var toUSD = function(num) {//converts num to USD
    return `$${num.toFixed(2)}`;
  }

  var dspStr = function(str) {//replaces hyphens from json text to spaces
    if (isNaN(Date.parse(str))) {//do not convert dates in string form
      returnStr =  str.replace('-', ' ');
      return returnStr;
    }
    return str;
  }

  //functions

  var countDaysLeft = function(obj) {//counts days left before due date can return negative if overdue
    var today = new Date(Date.now());
    var dueDate = new Date(obj.duedate)
    return  Math.floor((dueDate - today) / 1000 / 60 / 60 / 24);//returns num of days

  }

  var dspInterestStr = function (obj){
    if (obj.hasinterest){
      return `${obj.interestrate * 100}%
      accrues every ${obj.timeaccrued}`;
    }
    return `0% does not accrue`;
  }

  var calculateAccountInfo = function(obj) {//returns info on interest accrued, and total + interest
    var principal = obj.principal;
    var interestRate = obj.interestrate;
    var startDate = new Date(obj.startdate);
    var dueDate = new Date(obj.duedate)
    var timeUnitsPassed = 0; /*Represents Number of time units (months, days, years)
    that have elapsed between start and endDates*/
    switch (obj.timeaccrued) {
      case "day":
        timeUnitsPassed = (dueDate - startDate) / 1000 / 60 / 60 / 24 //Calculates days between dates
        break;
      case "week":
        timeUnitsPassed = (dueDate - startDate) / 1000 / 60 / 60/ 24 / 7 //Calculates weeks between dates
        break;
      case "month" :
        timeUnitsPassed = (dueDate.getMonth() + 1 + (dueDate.getFullYear * 12)) - (startDate.getMonth() + 1 + (dueDate.getFullYear * 12)) - 1
        if (dueDate.getDate() < startDate.getDate()) {
          timeUnitsPassed += 1 //if a full month has fully elapsed  count the last month of difference
        }
        else if(dueDate.getDate() >= numDaysByMonth[dueDate.getMonth()]) {
          /*in the case of january to february if the loan was
          made on Jan 31, there is no 31 of February so if the month has
          reached its end the interest should accrue even if does not reach the
          31st day b/c the month is over*/
          timeUnitsPassed = timeUnitsPassed += 1
        }
          break;
      default:
        console.error("Invalid compound option");
    }

    //Calculate Simple Interest
    var interestAccrued = interestRate * principal * timeUnitsPassed;

    //return object of info
    return {principal: principal,
            interestRate: interestRate,
            interestAccrued: interestAccrued,
            currentTotal: interestAccrued + principal
          };
  }

  //Dsp Owe Item summary
  var dspOweItemSummary = function(itemSummary) {//insert this
    //replace all hyphens in key values to spaces except for dates
    for (var key in itemSummary) {
      if (typeof(itemSummary[key]) == "string"){
        itemSummary[key] = dspStr(itemSummary[key]);
      }
    }
    //Determine whether to dsp owed to or owed from
    var owedToFromStr = itemSummary.islender ? "Owed To: " : "Owed From: ";
    var startDate = new Date(itemSummary.startdate)
    var dueDate = new Date(itemSummary.duedate)
    var accountSummary = calculateAccountInfo(itemSummary);
    var summaryHtml = `${owedToFromStr} ${itemSummary.otherpartyname}<br/>
    Loan Due Date: ${dueDate.toLocaleString()}<br/>
    Loan Start Date: ${startDate.toLocaleString()} <br/>
    Days Left: ${countDaysLeft(itemSummary)} <br/>
    Interest Summary: ${dspInterestStr(itemSummary)} <br/>
    Current Total: ${toUSD(accountSummary.currentTotal)} <br/>
    Original Principal: ${toUSD(itemSummary.principal)} <br/>
    Interest Accrued: ${toUSD(accountSummary.interestAccrued)}`;
    //Clear Modal modalContent
  //  clear(".modalContent");
    //Popup Modal
    $(".modal").css("display", "block");
    //Fill Moal Conent w/ item Summary
    //Compile summaryHtml
    console.log(summaryHtml);

    $(".modalContent").html(summaryHtml);
  }
  dspOweItems = function(itemsArray, tableToPlaceInId) {
    console.log(itemsArray);
    //takes array of items to display and tableId of table to put them in
    var dspItemDiv = "";
    tableToPlaceInId = "#" + tableToPlaceInId;
    clear(tableToPlaceInId);
    for (let item of itemsArray) {
      //Assemble Div display and attach data attributes
      $("<div"
        +  " data-islender="  + item.isLender
        +  " data-otherpartyname=" + item.otherPartyName
        +  " data-startdate=" + item.startDate
        +  " data-duedate=" + item.dueDate
        +  " data-hasinterest=" + item.hasInterest
        +  " data-interestrate=" + item.interest.rate
        +  " data-timeaccrued=" + item.interest.timeAccrued
        +  " data-collateral=" + item.collateral
        +  " data-principal=" + item.principal
         + " class='oweItem'>" +
      "<span class='otherPartyNameDsp'>" + item.otherPartyName  +"</span>" +
      "<span class='dueDateDsp'>" + item.dueDate  + "</span>" +
      "<span class='principleDsp'>" + item.principal + "</span>"
      + "</div>").appendTo(tableToPlaceInId); //Append Item Div
    }
    $(".oweItem").click(function(){//Attach Individual Click Handler;
      dspOweItemSummary($(this).data());//Passes Data attributes to display on modal
    })
  }

  dspOweItems(myData.owedFromItems, "owedFromItemsDsp");
  console.log(myData.owedFromItems[1]);
  var oweX = new OweItem(myData.owedFromItems[1]);
  console.log(oweX);
  var oweArr = [];
  for(var oweItemIdx = 0; oweItemIdx < myData.owedFromItems.length; oweItemIdx++) {
    oweArr.push(new OweItem(myData.owedFromItems[oweItemIdx]));
  }
  console.log(oweArr);
})
