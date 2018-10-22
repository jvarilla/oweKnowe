/*
Joseph Varilla
6/2/18
OweKnowe
An App to keep track of loans-
*/

//const numDaysByMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; //num of days by month in order
$(function(){
  /*for(var i = 0; i < 100; i++) {
    $("body").append("<h1>Hi</h1><br>");
  }*/

  $("#modalClose").click(function(){
    $(".modal").css("display", "none");
    $(".modalContent").html("");
    $("#addNewItemFormContainer").hide();
  })

  /*Utility functions*/
  var clear = function(elementName){//Should include . or # for element
    $(elementName).html("");
  }

  var toUSD = function(num) {//converts num to USD
    return `$${num.toFixed(2)}`;
  }




  console.log(oweArr);
  var myData = data;
  console.log(myData);
  var itemsThatUserOwes = [];
  var itemsOwedToUser = [];
  var totalDebtAmount = 0;
  var totalAmountOwed = 0;
  var numLentOverdue = 0;
  var numDebtOverdue = 0;
  var calculateSummaryStats = function(){//calculates summary stats and displays them in summary section
    totalDebtAmount = 0;
    totalAmountOwed = 0;
    numLentOverdue = 0;
    numDebtOverdue = 0;
    var today = new Date(Date.now());
    //Calculate Total Debt and how many are overdue
    for (var totalOwedIdx = 0; totalOwedIdx < itemsThatUserOwes.length; totalOwedIdx++){
      totalDebtAmount += Number(itemsThatUserOwes[totalOwedIdx].currentTotal);
      if (Number(itemsThatUserOwes[totalOwedIdx].daysLeftUntilDue) < 0) {
        numDebtOverdue++;
      }
    }
    //Calculate Total Amount Owed and how many are overdue
    for (var totalLentIdx = 0; totalLentIdx < itemsOwedToUser.length; totalLentIdx++){
      totalAmountOwed += Number(itemsOwedToUser[totalLentIdx].currentTotal);
      if (Number(itemsOwedToUser[totalLentIdx].daysLeftUntilDue) < 0) {
        numLentOverdue++;
      }
    }

    //Display Stats
    $("#dspDebtAmount").html(toUSD(totalDebtAmount));
    $("#dspNumDebtOverdue").html(`${numDebtOverdue} Loans`);
    $("#dspOwedAmount").html(toUSD(totalAmountOwed));
    $("#dspNumOwedOverdue").html(`${numLentOverdue} Loans`);


  }
  var sortByDateDsc = function(oweItemsArr) {//Sorts dates in dsc order of owe items for list view
    oweItemsArr.sort(function(a, b) {
      return b.dueDate - a.dueDate;
    })
    return oweItemsArr;
  }
  //Convert Sample Data from Json File into OweItem Objects and push them to the two holding arrays
  var convertJSONToOweItems = function(jsonFileArray){//Creates OweItems Objects from JSOn File
    var myOweItemsData = data;
    for(var oweItemIdx = 0; oweItemIdx < myData.owedFromItems.length; oweItemIdx++) {
      var tempOweItem = new OweItem(myData.owedFromItems[oweItemIdx]);
      if (tempOweItem.isLender) {
        itemsOwedToUser.push(tempOweItem);
      } else {
        itemsThatUserOwes.push(tempOweItem);
      }
    }
    console.log(`Items User Owes ${itemsThatUserOwes}`);
    console.log(`Items Owed To User ${itemsOwedToUser}`);

  }

  convertJSONToOweItems(data);

  var renderOweItemListView = function(oweItemsArr2, containerId) {//Takes array of OweItems and boolean to id of container to put it in
    oweItemsArr2 = sortByDateDsc(oweItemsArr2);
    $(containerId).children().remove();
    for(var oweItemsIdx = 0; oweItemsIdx < oweItemsArr2.length; oweItemsIdx++) {
      //If the id doesn't have the # then add it
      containerId = containerId.charAt(0) == '#' ? containerId : '#' + containerId;

      //takes array of items to display and tableId of table to put them in
      //Assemble Owe Item List Div display
        $("<div"
            + " data-refid=" + oweItemsIdx
            + " class='oweItem'>" +
            "<span class = 'itemListDsp'><span class='dueDateDsp'>" + oweItemsArr2[oweItemsIdx].printDueDate  + "</span>" +
            "<span class='otherPartyNameDsp'>\t|" + oweItemsArr2[oweItemsIdx].otherPartyName  +"</span>" +
            "<span class='principleDsp'>\t|" + toUSD(oweItemsArr2[oweItemsIdx].currentTotal) + "</span>" +
            "<span class='daysLeftDsp'>\t|" + oweItemsArr2[oweItemsIdx].daysLeftUntilDue + " Days Left|</span></span>" +
            "<span class='remove'>\t\tRemove</span>"
        + "</div>").appendTo(containerId); //Append Item Div
      }
      $("#owedToItemsDsp .oweItem .itemListDsp").click(function(){//Attach Individual Click Handler to display Owe Item Summary on Modal;
        //dspOweItemSummary($(this).data())
        $(".modal").css("display", "block");
        console.log(Number($(this).parent().data("refid")))
        console.log($(this).parent().parent().attr("id"));
        $(".modalContent").html("");
        $("#addNewItemFormContainer").hide();
        $(".modalContent").html("<h3>Summary is currently unavailable</h3>");
        $(".modalContent").html(itemsThatUserOwes[Number($(this).parent().data("refid"))].summaryStr);
        $("#removeOweItemBtn").show();
        $(".modalContent").data("refid", Number($(this).parent().data("refid")));
        $(".modalContent").data("arrid", $(this).parent().parent().attr("id"));
      })
      $("#owedFromItemsDsp .oweItem .itemListDsp").click(function(){//Attach Individual Click Handler to display Owe Item Summary on Modal;
        $(".modal").css("display", "block");
        $(".modalContent").html("");
        $("#addNewItemFormContainer").hide();
        $(".modalContent").html("<h3>Summary is currently unavailable</h3>");
        $(".modalContent").html(itemsOwedToUser[Number($(this).parent().data("refid"))].summaryStr);
        $("#removeOweItemBtn").show();
        $(".modalContent").data("refid", Number($(this).parent().data("refid")));
        $(".modalContent").data("arrid", $(this).parent().parent().attr("id"));
      })
      //Remove Owe Item and rerender list
      $(".remove").click(function(){
        console.log(Number($(this).parent().data("refid")));
        console.log($(this).parent().parent().attr("id"));
        console.log(($(this).parent().parent().attr("id")));
        switch ($(this).parent().parent().attr("id")) {
          case "owedToItemsDsp":
            itemsThatUserOwes.splice(Number($(this).parent().data("refid")), 1)
            renderOweItemListView(itemsThatUserOwes, "#owedToItemsDsp")
            console.log(itemsThatUserOwes);
            break;
          case "owedFromItemsDsp":
            itemsOwedToUser.splice(Number($(this).parent().data("refid")), 1)
            renderOweItemListView(itemsOwedToUser, "#owedFromItemsDsp");
            break;
          default:
            console.error("Invalid removal click");
        }
      });
      $(".modal").css("display", "none");
      calculateSummaryStats();
    }
  //Hide Add New Item Form
  $("#addNewItemFormContainer").hide();
  $("#addNewOweItemBtn").click(function(){
    $(".modalContent").html("");
    $("#addNewItemFormContainer").show();
    $("#removeOweItemBtn").hide();
    $(".modal").css("display", "block")
  })
  //sortByDateDsc(itemsThatUserOwes);
  //sortByDateDsc(itemsOwedToUser);
  renderOweItemListView(itemsThatUserOwes, "owedToItemsDsp");
  renderOweItemListView(itemsOwedToUser, "owedFromItemsDsp");
  //dspOweItems(myData.owedFromItems, "owedFromItemsDsp");
  console.log(myData.owedFromItems[1]);
  var oweX = new OweItem(myData.owedFromItems[1]);
  console.log(oweX);
  var oweArr = [];
  var addNewOweItemToList = function(oweItemObj) {//Takes OweItem obj and updates list view
    if (oweItemObj.isLender) {
      itemsOwedToUser.push(oweItemObj);
      renderOweItemListView(itemsOwedToUser, "#owedFromItemsDsp");
    } else {
      itemsThatUserOwes.push(oweItemObj);
      renderOweItemListView(itemsThatUserOwes, "#owedToItemsDsp");
    }
  }
  //Form Changes
  $("#startDateInput").datepicker();
  $("#dueDateInput").datepicker();
  $("#hasInterestInput").click(function(){
    console.log("Fired");
    if ($(this).is(":checked")) {
      $("#interestInfoContainer").slideDown(500);
    } else {
      $("#interestInfoContainer").slideUp(500);
    }

  })
  $("#dueDateLabel").click(function(){
    console.log("Fired");
      $("#startDateInput").slideUp(500)
      $("#dueDateInput").slideDown(500);
  });
  $("#startDateLabel").click(function(){
    console.log("Fired");
      $("#dueDateInput").slideUp(500);
      $("#startDateInput").slideDown(500);
  });
  $("#startDateInput").change(function(){
    $("#startDateLabel").html(`Start Date > ${$(this).val()}`)
  });
  $("#dueDateInput").change(function(){
    $("#dueDateLabel").html(`Due Date > ${$(this).val()}`)
  });
  var resetAddOweItemForm = function(){
    $("#addNewItemForm")[0].reset();
    $("#startDateLabel").html("Enter Start Date >");
    $("#dueDateLabel").html("Enter Due Date >");
    $("#dueDateInput").hide();
    $("#startDateInput").hide();
  }

  $("#addOweItemSubmitBtn").click(function(){
    console.log("Form Submitted");
    //Validate The Form and Concatenate Error String
    var errorStr = "";
    $("#errorDsp").html("");
    if ((
       ($("#isLenderInput").is(":checked") == false)
          && ($("#isBorrowerInput").is(":checked") == false))){
          errorStr+= "Select if you are a lender or borrower<br/>";
    }
    if ($("#otherPartyNameInput").val() == ""){
      errorStr+= "Please enter the name of the other party<br/>";
    }
    if ($("#hasInterestInput").is(":checked")) {
      if (Number($("#interestRateInput").val()) == 0) {
        errorStr+= "Enter The Interest Rate<br/>";
      }
    }
    if (errorStr.length != 0) {//Has errors
      $("#errorDsp").html(errorStr).css("color", "red");;
    } else { //No errors so compile object
      //Create Object from form Data
      var newObj = {};
      newObj.isLender = $("#isLenderInput").is(":checked"); //true or false
      newObj.otherPartyName = $("#otherPartyNameInput").val();
      newObj.startDate = $("#startDateInput").val();
      newObj.dueDate = $("#dueDateInput").val();
      newObj.hasInterest = $("#hasInterestInput").is(":checked");
      newObj.interest = {};
      newObj.interest.rate = Number($("#interestRateInput").val()) / 100;
      newObj.interest.timeAccrued = $("#timeAccruedInput").val();
      newObj.interest.isCompounded = $("#isCompoundedInput").is(":checked");
      newObj.collateral = $("#collateralInput").val();
      newObj.principal = Number($("#principalInput").val());
      console.log(newObj);
      var newOweItemObj = new OweItem(newObj);
      console.log(newOweItemObj);
      addNewOweItemToList(newOweItemObj);
      //insert Reset for form
      resetAddOweItemForm()
      $("#errorDsp").html("Item Successfully Added").css("color", "green");
    }
    return false;
  })
  $("#removeOweItemBtn").click(function(){
    switch ($(this).siblings(".modalContent").data("arrid")) {
      case "owedToItemsDsp":
        itemsThatUserOwes.splice(Number($(this).siblings(".modalContent").data("refid")), 1)
        renderOweItemListView(itemsThatUserOwes, "#owedToItemsDsp")
        console.log(itemsThatUserOwes);
        break;
      case "owedFromItemsDsp":
        itemsOwedToUser.splice(Number($(this).siblings(".modalContent").data("refid")), 1)
        renderOweItemListView(itemsOwedToUser, "#owedFromItemsDsp");
        break;
      default:
        console.error("Invalid removal click");
    }
  });

})
