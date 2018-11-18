// 变量表示操作是否为修改
var isEdit = false;
// 是否首次加载弹出
var isFirstLoadProModal = true;
var proMatT = $("#proMatTable");
// 子订单实体类
var proData = null;
// 保存原材料列表的数组信息
var materialRawViewList;
// 点击原材料列表的下标
var matIndex;
// 是否需要初始化子订单表格
var isInitSubOrdTab = true;
var $subordTab = $("#subOrdTab");
// 存放子订单的数组
var subordList = new Array();
var matchStyleSelectList = new Array();
var orderStatusList = new Array();
// 标记操作是保存非提交
var isSave = false;
// 保存当前tab页面的集合对象
var tabList = new Array();
var myDropzone;
// 存储子订单缩略图的数组
var picList = new Array();

// 存放页面订单信息的对象
function OrderBean(
  id,
  ctlId,
  cltName,
  platform,
  tel,
  address,
  userRemark,
  subOrder,
  orderCost,
  transCost,
  totalCost,
  cost,
  income,
  recivAccount
) {
  this.id = id;
  this.ctlId = ctlId;
  this.cltName = cltName;
  this.platform = platform;
  this.tel = tel;
  this.address = address;
  this.userRemark = userRemark;
  this.orderCost = orderCost;
  this.transCost = transCost;
  this.totalCost = totalCost;
  this.cost = cost;
  // this.profit = "";
  // this.profitRate = "";
  // this.orderStatus = "";
  // this.isOrderAfter = "";
  // this.payStatus = "";
  // this.approvalDate = "";
  // this.cOrdPerson = "";
  // this.cOrdDate = "";
  // this.mOrdPerson = "";
  // this.mOrdDate = "";
  // this.approOrdPerson = "";
  // this.approOrdDate = "";
  // this.confmOrdPerson = "";
  // this.confmOrdDate = "";
  // this.transPerson = "";
  // this.transDate = "";
  this.recivAccount = recivAccount;
  this.income = income;
  this.subOrder = subOrder;
}
var orderBean;
var orderIndex = 0;
// 当前在页面在session中的key
var sessionKey;

$(document).ready(function() {
  Dropzone.autoDiscover = false;
  initHtml();
});

$(function() {
  $("#customerTable").bootstrapTable({
    locale: "zh-CN",
    url: "./customers",
    method: "get", //请求方式（*）
    pagination: true, //是否分页
    singleSelect: true, //仅允许单选
    dataType: "json",
    sidePagination: "server", //服务端处理分页
    silentSort: false,
    pageList: [10, 25, 50, 100],
    pageSize: 10,
    pageNumber: 1,
    detailView: false,
    search: false, //是否显示刷新按钮
    /*   showColumns: true,                  //是否显示所有的列
             showRefresh: true,        */
    minimumCountColumns: 2, //最少允许的列数
    // toolbar: '#toolbar',
    clickToSelect: true, //是否启用点击选中行
    queryParams: function(params) {
      var pageNo = 0;
      if (params.offset == 0) {
        pageNo = 1;
      } else {
        pageNo = params.offset / params.limit + 1;
      }

      var json = {
        pageSize: params.limit,
        pageNum: pageNo,
        OR_LIKE_accountPlatform: $("#searchCustomerCondition").val(),
        OR_LIKE_name: $("#searchCustomerCondition").val()
      };
      return json;
    },
    columns: [
      {
        checkbox: true
      },
      {
        field: "uuid",
        title: "UUID",
        visible: false
      },
      {
        field: "name",
        title: "客户名称"
      },
      {
        field: "accountPlatform",
        title: "平台ID"
      },
      {
        field: "address",
        title: "address",
        visible: false
      },
      {
        field: "tel",
        title: "tel",
        visible: false
      },
      {
        field: "platform",
        title: "originPlatform",
        visible: false
      }
    ]
  });
});

function searchCustomer() {
  $("#customerTable").bootstrapTable("refresh");
}

function completeSearchCustomer() {
  var row = $("#customerTable").bootstrapTable("getSelections");
  // var custormerId = row[0].uuid;
  //    console.log("id:" + custormerId);
  var platformId = row[0].accountPlatform;
  var name = row[0].name;
  var platform = row[0].originPlatform;
  var address = row[0].address;
  var tel = row[0].tel;
  // 设置当前tab标签
  $("#orderTab .active").text(platformId);

  $("#accPlat").val(platformId);
  $("#customerName").val(name);
  $("#address").val(address);
  $("#tel").val(tel);
  $("#platform").val(platform);

  $("#searchCustomerModal").modal("hide");
}

function initHtml() {
  console.log("materialPro_add.html");
  // 初始化相应JS
  App.tableFilters();
  tabList.push("orderTab_0");
  // 获取加工方式列表数据
  getDicList("machStyle", matchStyleSelectList);
  // 获取订单状态列表数据
  getDicList("orderStatus", orderStatusList);
  // 初始化整体界面
  $(".page-title span").text("新增订单");
  // 初始化页面数据
  initDataForHtml();
  // 隐藏Alert
  hideAlert("insertSuccess");
  // 监听标签页变化(防止监听器多次加载)
  $(document)
    .unbind("shown.bs.tab")
    .on("shown.bs.tab", 'a[data-toggle="tab"]', function(e) {
      // 存储当前界面信息
      saveHtmlData(String(e.relatedTarget));
      // 恢复新界面信息
      restoreHtml(String(e.target));
      // 保存当前界面的key值
      sessionKey = String(e.target);
      // console.log("relatedTarget:" + e.relatedTarget + " ,target:" + e.target);
    });
  // 重新指定select2的父容器
  $("#selectMaterial").select2({
    dropdownParent: $("#addProductModal")
  });

  $("#selectPro").select2({
    dropdownParent: $("#addProductModal")
  });

  // 获取物料成品信息填充下拉选择器
  $.get(
    "./materielPro/getVisibleData/",
    function(result) {
      // console.log("result:" + result.code);
      if (result != null && result.data != null) {
        var materialProViewList = result.data;
        materialProViewList.forEach(function showData(value, index) {
          $("#selectPro").append(
            "<option value='" +
              value.matid +
              "'>" +
              value.internalId +
              "/" +
              value.name +
              "</option>"
          );
        });
      }
    },
    "json"
  );

  // 新增产品时搜索添加产品
  $("#selectPro")
    .unbind("select2:select")
    .on("select2:select", function(e) {
      // Default is hidden in the modal alert
      hideAlert("insertSuccess");
      var data = e.params.data;
      var id = data.id;
      if (id == "-1") {
        actionUnProduct();
      } else {
        $.get(
          "./materielPro/getMaterialProView/" + id,
          function(result) {
            // console.log("result:" + result.code);
            if (result != null && result.data != null) {
              proData = result.data;
              $("#materialId").val(proData.matid);
              $("#materialName").val(proData.name);
              $("#curtainWidth").val(proData.curtainWidth);
              $("#curtainHeight").val(proData.curtainHeight);
              $("#materialRemark").val(proData.remarks);
              // 扩展缩略图属性
              proData.picList = picList;

              // 添加扩展属性
              $.each(proData.strViewList, function(index, obj) {
                obj.machFee = 0;
                // 合计售价
                obj.calTotal = 0;
                // 合计成本
                obj.calCost = 0;
                obj.machRemark = "";
                // console.log("obj:" + obj.toString);
                obj.uniqueID = uniqId();
              });
              if (isFirstLoadProModal) {
                initProMatTable(proData.strViewList);
                countSubOrdTotalCost();
              } else {
                proMatT.bootstrapTable("load", proData.strViewList);
                countSubOrdTotalCost();
              }
            }
          },
          "json"
        );
      }
    });

  // 获取物料成品信息填充下拉选择器
  $.get(
    "./materielRaw/getVisibleData/",
    function(result) {
      // console.log("result:" + result.code);
      if (result != null && result.data != null) {
        // 初始化原料选择view
        materialRawViewList = result.data;
        materialRawViewList.forEach(function showData(value, index) {
          $("#selectMaterial").append(
            "<option value='" +
              value.matid +
              "'>" +
              value.internalId +
              "/" +
              value.name +
              "</option>"
          );
        });
      }
    },
    "json"
  );

  // 新增产品时搜索添加产品
  $("#selectMaterial")
    .unbind("select2:select")
    .on("select2:select", function(e) {
      var data = e.params.data;
      var id = data.id;
      // console.log("id:" + id);
      for (var i = 0; i < materialRawViewList.length; ++i) {
        var matid = materialRawViewList[i].matid;
        // console.log("matid:" + matid);
        if (matid == id) {
          // console.log("selectIndex:" + i);
          matIndex = i;
          break;
        }
      }
    });

  // 模糊动态框监控事件
  $("#addProductModal")
    .unbind("show.bs.modal")
    .on("show.bs.modal", function(event) {
      var button = $(event.relatedTarget); // Button that triggered the modal
      var recipient = button.data("whatever"); // Extract info from data-* attributes
      if (recipient === "add") {
        isEdit = false;
        $("#insertBtn").text("添加");
        resetSuborderModal();
      } else {
        isEdit = true;
        $("#insertBtn").text("更新");
      }
    });

  $("#addProductModal")
    .unbind("shown.bs.modal")
    .on("shown.bs.modal", function(e) {
      if (myDropzone == null) {
        myDropzone = new Dropzone("#myDropzone", {
          url: "/file/upload",
          dictDefaultMessage: "可以将图片推拽到此处",
          acceptedFiles: "image/*",
          autoProcessQueue: false,
          init: function() {
            this.on("addedfile", function(file) {
              // Create the remove button
              var removeButton = Dropzone.createElement(
                "<button class='btn btn-space btn-danger max-length space-margin-top'>移除图片</button>"
              );

              // Capture the Dropzone instance as closure.
              var _this = this;

              // Listen to the click event
              removeButton.addEventListener("click", function(e) {
                // Make sure the button click doesn't submit the form:
                e.preventDefault();
                e.stopPropagation();

                // Remove the file preview.
                _this.removeFile(file);
                if (file.status == "success") {
                  // If you want to the delete the file on the server as well,
                  // you can do the AJAX request here.

                  // If server has delete the file and memory delete file-object at the same time.
                  deletePicFile(file.name);
                }
              });

              // Add the button to the file preview element.
              file.previewElement.appendChild(removeButton);
            });

            this.on("success", function(file, result) {
              // console.log(result);
              if (result != null) {
                result.data.size = file.size;
                picList.push(result.data);
              }
            });

            this.on("queuecomplete", function() {
              // 将子订单的图片集合保存到proData对象中
              proData.picList = picList;
            });
          }
        });
      }
      $("#submitImg").on("click", function(e) {
        if (proData == null) {
          alert("请先选择订单产品！");
        } else {
          myDropzone.processQueue();
        }
      });
    });

  // 初始化订单状态
  // var temp = $("#showOrderStatus").text();
  // $("#showOrderStatus").text(temp + "待保存");
  editSpanText($("#showOrderStatus"), "待保存", false);

  // 初始化客户动态弹框
  $("#searchCustomerModal")
    .unbind("show.bs.modal")
    .on("show.bs.modal", function(event) {
      var conditionStr = $("#accPlat").val();

      // 将前景页面输入的平台ID号读取过来
      $("#searchCustomerCondition").val(conditionStr);
      // 搜索框绑定回车键
      $("#searchCustomerCondition")
        .unbind("keypress")
        .bind("keypress", function(event) {
          if (event.keyCode == "13") {
            searchCustomer();
          }
        });
    });
  // 监控运费输入
  $("#transCost")
    .off("change")
    .change(function() {
      var formatVal = 0;
      var orderCost = $("#orderCost").val();
      var totalCost = 0;
      var isValid = $("#transCost")
        .parsley()
        .isValid();
      if (isValid) {
        formatVal = formatNumber($("#transCost").val(), 2);
        // 运费修改重新计算合计值
        totalCost = parseFloat(orderCost) + parseFloat(formatVal);
        $("#transCost").val(formatVal);
        $("#totalCost").val(totalCost);
      }
    });

  $("#searchCustomerModal")
    .unbind("shown.bs.modal")
    .on("shown.bs.modal", function(event) {
      // 焦点定位到搜索框上
      $("#searchCustomerCondition").focus();
    });

  // var ajax_option = {
  //   // beforeSubmit: showRequest, //提交前的回调函数
  //   success: showResponse //提交后的回调函数
  // };
  // $("#defaultForm").ajaxForm(ajax_option);
  $("#defaultForm").ajaxForm(function(result) {
    if (result != null && result.code == 0) {
      if (isSave) {
        alert("订单保存成功!");
        // 用户保存订单操作
        $("#id").val(result.data);
        editSpanText($("#orderId"), result.data, true);
      } else {
        alert("订单提交成功!");
        changeTab();
      }
    }
  }, "json");
}

/**
 * 子订单图片集合中删除该图片
 * @param {图片名称} fileName
 */
function deletePicFile(fileName) {
  $.each(picList, function(index, value) {
    if (fileName === value.fileName) {
      picList.pop(value);
      return; // 一次只删除一张图片
    }
  });
}

/**
 * 切换订单标签
 */
function changeTab() {
  // 切换其它tab 关闭当前tab
  var tabView = $("#orderTab .active").parent();
  var tabKey = $("#orderTab .active").attr("href");
  // session中移除订单
  sessionStorage.removeItem(tabKey);
  // 订单集合移除该订单
  if (tabList.length > 1) {
    // 当前订单界面还有其它订单
    tabView.remove();
    tabList.pop();
    $("#orderTab li:first a").trigger("click");
  } else {
    // 当前订单界面只有唯一订单,跳转到订单列表界面
    changeMenu("html/order/sellOrder_list.html");
    // 清空当前界面变量
    myDropzone = null;
  }
}

/**
 * 取消提交的方法
 */
function cancelSubmit() {
  changeTab();
}

/**
 * 选择了非成品
 */
function actionUnProduct() {
  proData = new Object();
  proData.strViewList = new Array();
  proData.matid = "-1";
  proData.name = "非成品";
  proData.curtainWidth = 0;
  proData.curtainHeight = 0;
  proData.remarks = "";
  $("#materialId").val(proData.matid);
  $("#materialName").val(proData.name);
  $("#curtainWidth").val(proData.curtainWidth);
  $("#curtainHeight").val(proData.curtainHeight);
  $("#materialRemark").val(proData.remarks);
  $("#installPosi").val("-");
  $("#saleNum").val(0);

  if (isFirstLoadProModal) {
    initProMatTable(proData.strViewList);
    countSubOrdTotalCost();
  } else {
    proMatT.bootstrapTable("load", proData.strViewList);
    countSubOrdTotalCost();
  }
}

function editSpanText(viewBean, str, isReset) {
  if (isReset) {
    viewBean.text(str);
  } else {
    var temp = viewBean.text();
    viewBean.text(temp + str);
  }
}

/**
 *   初始化产品组成列表的方法
 */
function initProMatTable(dataList) {
  isFirstLoadProModal = false;
  proMatT.bootstrapTable({
    data: dataList,
    // toolbar: '#toolbar',
    // clickToSelect: true, //是否启用点击选中行
    columns: [
      {
        checkbox: true
      },
      {
        field: "uniqueID",
        title: "uniqueID",
        visible: false
      },
      {
        field: "rawid",
        title: "rawid",
        visible: false
      },
      {
        field: "name",
        title: "物料名称"
      },
      {
        field: "internalId",
        title: "内部ID"
      },
      {
        field: "total",
        title: "数量",
        formatter: function(value, row, index) {
          // console.log("index:" + index);
          var html =
            '<input id="proMatTotal' +
            index +
            '" name="structList[' +
            index +
            '].total" value="' +
            value +
            '" data-parsley-trigger="input" data-parsley-type="number" data-parsley-error-message="只能输入整数" required/>';
          return html;
        }
      },
      {
        field: "unit",
        title: "单位",
        visible: true
      },
      {
        field: "sellPrice",
        title: "单价",
        formatter: function(value, row, index) {
          var html =
            '<input id="proMatSellPrice' +
            index +
            '" name="structList[' +
            index +
            '].sellPrice" value="' +
            value +
            '" data-parsley-trigger="input" data-parsley-type="number" step="0.01" data-parsley-error-message="只能输入2位小数" required/>';
          return html;
        }
      },
      {
        field: "machStyle",
        title: "加工方式",
        formatter: function(value, row, index) {
          var defaultValue = "-1";
          if (value != null) {
            defaultValue = value;
          }
          var html = constructMachStyleSelectView(
            "proMatMacFee" + index,
            defaultValue
          );
          return html;
        }
      },
      {
        field: "machFee",
        title: "加工费",
        formatter: function(value, row, index) {
          var html =
            '<input id="proMatMacFee' +
            index +
            '" name="structList[' +
            index +
            '].macFee" data-parsley-trigger="input" data-parsley-type="number"  value="' +
            value +
            '" data-parsley-error-message="只能输入1位小数" required/>';

          return html;
        }
      },
      {
        field: "calTotal",
        title: "合计",
        formatter: function(value, row, index) {
          var list = proData.strViewList;
          var sellPrice = list[index].sellPrice;
          var num = list[index].total;
          var machFee = list[index].machFee;
          var sum = sellPrice * num;
          sum = parseFloat(sum) + parseFloat(machFee);

          sum = formatNumber(sum.toString(), 2);
          var unitCost = list[index].cost;
          var calCost = unitCost * num;
          // 将合计赋值到对象中
          list[index].calTotal = sum;
          list[index].calCost = formatNumber(calCost.toString(), 2);
          var html =
            '<input data-parsley-trigger="input" readonly="readonly" data-parsley-type="number" step="0.01" data-parsley-error-message="只能输入2位小数" value="' +
            sum +
            '" required/>';
          return html;
        }
      },
      {
        field: "machRemark",
        title: "加工备注",
        formatter: function(value, row, index) {
          var html =
            '<input id="proMatMacRemark' +
            index +
            '" name="structList[' +
            index +
            '].machRemark" value="' +
            value +
            '"type="text"/>';
          return html;
        }
      }
    ]
  });
  // 绑定表格点击单元格事件
  proMatT
    .unbind("click-cell.bs.table")
    .on("click-cell.bs.table", function(e, field, value, row, $element) {
      // console.log("field:" + field);
      var inputSelec = $element.find("input:first");
      var selectView = $element.find("select:first");
      var rowIndex = $element.closest("tr").attr("data-index");
      // console.log("rowIndex:" + rowIndex);
      if (inputSelec.is("input")) {
        inputSelec.off("change").change(function() {
          var formatVal = "";
          if (field != "machRemark") {
            // console.log("num");
            var pointNum = -1; // 设置输入数字小数点位数的范围
            var isValid = inputSelec.parsley().isValid();
            if (isValid) {
              switch (
                field // 判断当前单元格所属列
              ) {
                case "total":
                  pointNum = -1;
                  break;
                case "sellPrice":
                  pointNum = 2;
                  break;
                case "machFee":
                  pointNum = 2;
                  break;
                default:
                  break;
              }
              formatVal = formatNumber(inputSelec.val(), pointNum);
              // console.log("rowIndex:" + rowIndex + " ,fieId:" + field + " ,value:" + formatVal);
            }
          } else {
            // 输入备注不需要验证是否为数字
            // console.log("machRemark");
            formatVal = inputSelec.val();
          }
          // 更新该行的数据
          updateRow(rowIndex, field, formatVal);
        });
      }
      if (selectView.is("select")) {
        selectView.off("change").change(function() {
          var optionSelected = $("option:selected", this);
          var valueSelected = this.value;
          var strSelected = optionSelected.text();
          // console.log("select text:");
          // 更新该行的数据
          updateRow(rowIndex, field, valueSelected);
        });
      }
    });
}

/**
 *
 * @param {选择器ID} viewId
 */
function constructMachStyleSelectView(viewId, machStyle) {
  var htmlStr =
    "<select id='" + viewId + "'>" + "<option value='-1'>-</option>";
  if (matchStyleSelectList !== null) {
    $.each(matchStyleSelectList, function(index, value) {
      var optionStr;
      if (machStyle !== null && machStyle === value.colName) {
        // 设置默认值
        optionStr =
          "<option value='" +
          value.colName +
          "' selected='selected'>" +
          value.content +
          "</option>";
      } else {
        optionStr =
          "<option value='" +
          value.colName +
          "'>" +
          value.content +
          "</option>";
      }
      htmlStr = htmlStr + optionStr;
    });
  }
  return htmlStr + "</select>";
}

function initDataForHtml(key) {
  orderBean = storage.getItem(key);
}

function updateRow($rowIndex, $field, $value) {
  proMatT.bootstrapTable("updateCell", {
    index: $rowIndex,
    field: $field,
    value: $value
  });
  countSubOrdTotalCost();
}

/**
 *   计算当前子订单的合计金额
 **/
function countSubOrdTotalCost() {
  var allTableData = proMatT.bootstrapTable("getData"); //获取表格的所有内容行
  var sum = 0;
  var cost = 0;
  if (allTableData != null) {
    for (let index = 0; index < allTableData.length; index++) {
      const rowBean = allTableData[index];
      // alert(rowBean.calTotal);
      sum = parseFloat(sum) + parseFloat(rowBean.calTotal);
      cost = parseFloat(cost) + parseFloat(rowBean.calCost);
    }
  }

  $("#subtotal").val(sum);
  $("#subCost").val(cost);
}

function addMat() {
  // console.log("acIndex:" + matIndex);
  if (proData != null) {
    if (matIndex != null || matIndex != undefined) {
      // 深度clone数组
      // var tempMatList = materialRawViewList.map(a => Object.assign({}, a));
      var acBean = new Object();
      Object.assign(acBean, materialRawViewList[matIndex]);
      if (acBean != null) {
        // 封装成表格所需要的数据
        acBean.machFee = 0;
        acBean.machStyle = "-1";
        acBean.calTotal = 0;
        acBean.machRemark = "";
        acBean.sellPrice = acBean.retailPrice;
        acBean.total = 0;
        acBean.rawid = acBean.matid;
        // var uniqueID = uniqId();
        acBean.uniqueID = uniqId();

        proData.strViewList.push(acBean);
        // console.log("acBean:" + acBean);
        // 更新表格中的数据
        proMatT.bootstrapTable("load", proData.strViewList);
      }
    }
  }
}

/**
 *   删除子订单中的指定原材料
 **/
function deleteMaterielTableRow() {
  var ids = $.map(proMatT.bootstrapTable("getSelections"), function(row) {
    // console.log("row:" + row);
    return row.uniqueID;
  });
  proMatT.bootstrapTable("remove", {
    field: "uniqueID",
    values: ids
  });
  countSubOrdTotalCost();
}

/**
 *   将物料转换为子订单实体类的方法
 **/
function matToSubOrd(matBean) {
  var subOrdBean = matBean;
  // 设置当前状态为待确认:0
  subOrdBean.currentStatus = 0;
  subOrdBean.installPosi = $("#installPosi").val();
  subOrdBean.saleNum = $("#saleNum").val();
  subOrdBean.subtotal = $("#subtotal").val();
  subOrdBean.cost = $("#subCost").val();
  subOrdBean.uniqueID = uniqId();
  // 扩展非成品属性
  if (subOrdBean.matid == "-1") {
    
  }

  return subOrdBean;
}

function insertSuborderTab() {
  // 验证子订单信息是否正确
  if (verifySubOrder()) {
    // 关闭Modal
    $("#addProductModal").modal("hide");
    if (isEdit) {
      proData.installPosi = $("#installPosi").val();
      proData.saleNum = $("#saleNum").val();
      proData.subtotal = $("#subtotal").val();
      proData.cost = $("#subCost").val();
    } else {
      subordList.push(matToSubOrd(proData));
    }
    // console.log("subordList:" + subordList.toString);
    if (isInitSubOrdTab) {
      // console.log("subordList:" + subordList.toString);
      initSubOrdTab(subordList);
      countOrderInfo();
    } else {
      $subordTab.bootstrapTable("load", subordList);
      countOrderInfo();
    }
  }
}

function verifySubOrder() {
  var verifyResult = true;
  // $("#suborderForm").parsley();
  // $("#suborderForm").submit(function (e) {
  //   e.preventDefault();
  //   console.log("submitted successfully");
  // });
  // if ($('#materialId').parsley().isValid()
  // && $('#materialName').parsley().isValid()
  // && $('#curtainWidth').parsley().isValid()
  // && $('#curtainHeight').parsley().isValid()
  // && $('#installPosi').parsley().isValid()
  // && $('#saleNum').parsley().isValid()) {
  //   verifyResult = true;
  // }

  var parsley_valiation_options = {
    //errorsWrapper: '',
    errorTemplate: '<span class="error-msg"></span>',
    errorClass: "error"
  };
  $("#addProductModal input").parsley(parsley_valiation_options);
  $("#addProductModal input").each(function() {
    if (
      $(this)
        .parsley()
        .validate() !== true
    ) {
      verifyResult = false;
    }
  });
  return verifyResult;
}

function initSubOrdTab(dataList) {
  isInitSubOrdTab = false;
  $subordTab.bootstrapTable({
    data: dataList,
    detailView: true,
    // toolbar: '#toolbar',
    // clickToSelect: true, //是否启用点击选中行
    columns: [
      {
        checkbox: true
      },
      {
        field: "uniqueID",
        title: "uniqueID",
        visible: false
      },
      {
        field: "matid",
        title: "物料ID",
        visible: false
      },
      {
        field: "name",
        title: "成品名称"
      },
      {
        field: "internalId",
        title: "内部ID"
      },
      {
        field: "installPosi",
        title: "安装位置",
        formatter: function(value, row, index) {
          var html =
            "<span>" +
            value +
            "</span><input type='hidden' name='subOrder[" +
            index +
            "].installPosi' value='" +
            value +
            "'>";
          return html;
        }
      },
      {
        field: "curtainWidth",
        title: "窗帘宽度",
        formatter: function(value, row, index) {
          var html =
            "<span>" +
            value +
            "</span><input type='hidden' name='subOrder[" +
            index +
            "].curtainWidth' value='" +
            value +
            "'>";
          return html;
        }
      },
      {
        field: "curtainHeight",
        title: "窗帘高度",
        formatter: function(value, row, index) {
          var html =
            "<span>" +
            value +
            "</span><input type='hidden' name='subOrder[" +
            index +
            "].curtainHeight' value='" +
            value +
            "'>";
          return html;
        }
      },
      {
        field: "saleNum",
        title: "产品数量",
        formatter: function(value, row, index) {
          var html =
            "<span>" +
            value +
            "</span><input type='hidden' name='subOrder[" +
            index +
            "].saleNum' value='" +
            value +
            "'>";
          return html;
        }
      },
      {
        field: "subtotal",
        title: "子订单金额",
        formatter: function(value, row, index) {
          var html =
            "<span>" +
            value +
            "</span><input type='hidden' name='subOrder[" +
            index +
            "].subtotal' value='" +
            value +
            "'>";
          return html;
        }
      },
      {
        field: "currentStatus",
        title: "当前状态",
        formatter: function(value, row, index) {
          var html =
            "<span>" +
            getDicNameByCode(value, orderStatusList) +
            "</span><input type='hidden' name='subOrder[" +
            index +
            "].currentStatus' value='" +
            value +
            "'>";
          return html;
        }
      },
      {
        field: "remarks",
        title: "加工备注",
        formatter: function(value, row, index) {
          var html =
            "<span>" +
            value +
            "</span><input type='hidden' name='subOrder[" +
            index +
            "].machRemark' value='" +
            value +
            "'>";
          return html;
        }
      },
      {
        field: "empty",
        title: "操作",
        formatter: function(value, row, index) {
          var matId = subordList[index].matid;
          var cost = subordList[index].cost;
          var picArray = subordList[index].picList;
          var picStr = "";
          $.each(picArray, function(index, value) {
            picStr = picStr + value.uuid + ";";
          });
          var html =
            "<button type='button' class='btn btn-space btn-primary' onclick='editSuborder(" +
            index +
            ")' data-toggle='modal' data-target='#addProductModal' data-whatever='edit'>修改</button><input type='hidden' name='subOrder[" +
            index +
            "].matid' value='" +
            matId +
            "'><input type='hidden' name='subOrder[" +
            index +
            "].cost' value='" +
            cost +
            "'><input type='hidden' name='subOrder[" +
            index + 
            "].picUuids' value='" +
            picStr + "'>";
          return html;
        }
      }
    ],
    //注册加载子表的事件。注意下这里的三个参数！
    onExpandRow: function(index, row, $detail) {
      var subTabData = subordList[index].strViewList;
      insertSubTable(index, row, $detail, subTabData);
    }
  });
}

function insertSubTable(indexP, rowP, $detail, dataList) {
  var cur_table = $detail.html("<table></table>").find("table");
  // console.log("dataList:" + dataList);
  cur_table.bootstrapTable({
    data: dataList,
    // toolbar: '#toolbar',
    // clickToSelect: true, //是否启用点击选中行
    columns: [
      {
        field: "rawid",
        title: "物料ID",
        formatter: function(value, row, index) {
          var html =
            "<span>" +
            value +
            "</span><input type='hidden' name='subOrder[" +
            indexP +
            "].structList[" +
            index +
            "].matid' value='" +
            value +
            "'>";
          return html;
        }
      },
      {
        field: "name",
        title: "物料名称"
      },
      {
        field: "internalId",
        title: "内部ID"
      },
      {
        field: "total",
        title: "数量",
        formatter: function(value, row, index) {
          var html =
            "<span>" +
            value +
            "</span><input type='hidden' name='subOrder[" +
            indexP +
            "].structList[" +
            index +
            "].total' value='" +
            value +
            "' form='defaultForm'>";
          return html;
        }
      },
      {
        field: "unit",
        title: "单位"
      },
      {
        field: "sellPrice",
        title: "单价",
        formatter: function(value, row, index) {
          var html =
            "<span>" +
            value +
            "</span><input type='hidden' name='subOrder[" +
            indexP +
            "].structList[" +
            index +
            "].sellPrice' value='" +
            value +
            "'>";
          return html;
        }
      },
      {
        field: "machStyle",
        title: "加工方式",
        formatter: function(value, row, index) {
          var defaultValue = "-1";
          if (value != null) {
            defaultValue = value;
          }
          var html =
            "<span>" +
            getDicNameByCode(defaultValue, matchStyleSelectList) +
            "</span><input type='hidden' name='subOrder[" +
            indexP +
            "].structList[" +
            index +
            "].machStyle' value='" +
            defaultValue +
            "'>";
          return html;
        }
      },
      {
        field: "machFee",
        title: "加工费",
        formatter: function(value, row, index) {
          var html =
            "<span>" +
            value +
            "</span><input type='hidden' name='subOrder[" +
            indexP +
            "].structList[" +
            index +
            "].machFee' value='" +
            value +
            "'>";
          return html;
        }
      },
      {
        field: "calTotal",
        title: "合计"
      },
      {
        field: "machRemark",
        title: "加工备注",
        formatter: function(value, row, index) {
          var cost = dataList[index].cost;
          var html =
            "<span>" +
            value +
            "</span><input type='hidden' name='subOrder[" +
            indexP +
            "].structList[" +
            index +
            "].machRemark' value='" +
            value +
            "'><input type='hidden' name='subOrder[" +
            indexP +
            "].structList[" +
            index +
            "].cost' value='" +
            cost +
            "'>";
          return html;
        }
      }
    ]
  });
}
/**
 * 通过状态码获取字典状态名称的方法
 * @param {*} statuCode
 */
function getDicNameByCode(statuCode, selectList) {
  var dicList = selectList;
  var formatStatueCode = statuCode + "";
  var dicName = "-";
  if (dicList !== null) {
    // console.log("getDicNameByCode");
    $.each(dicList, function(index, value) {
      if (value.colName === formatStatueCode) {
        dicName = value.content;
        return dicName;
      }
    });
  }
  return dicName;
}

function showRequest(formData, jqForm, options) {
  // formData is an array; here we use $.param to convert it to a string to display it
  // but the form plugin does this for you automatically when it submits the data
  var queryString = $.param(formData);

  // jqForm is a jQuery object encapsulating the form element.  To access the
  // DOM element for the form do this:
  // var formElement = jqForm[0];

  alert("About to submit: \n\n" + queryString);

  // here we could return false to prevent the form from being submitted;
  // returning anything other than false will allow the form submit to continue
  return true;
}

// post-submit callback
function showResponse(responseText, statusText, xhr, $form) {
  // for normal html responses, the first argument to the success callback
  // is the XMLHttpRequest object's responseText property

  // if the ajaxForm method was passed an Options Object with the dataType
  // property set to 'xml' then the first argument to the success callback
  // is the XMLHttpRequest object's responseXML property

  // if the ajaxForm method was passed an Options Object with the dataType
  // property set to 'json' then the first argument to the success callback
  // is the json data object returned by the server

  alert(
    "status: " +
      statusText +
      "\n\nresponseText: \n" +
      responseText +
      "\n\nThe output div should have already been updated with the responseText."
  );
}

function addTab() {
  // var posi = $('#orderTab li:nth-last-child(n)')
  orderIndex++;
  var tabId = "orderTab_" + orderIndex;

  tabList.push(tabId);
  $("#orderTab").prepend(
    "<li id='" +
      tabId +
      "' class='nav-item'><a data-toggle='tab' role='tab' class='nav-link' href='#html/order/sellOrder_add/order_" +
      orderIndex +
      ".html' aria-selected='false'>新订单" +
      orderIndex +
      "</a></li>"
  );
}

function saveHtmlData(key) {
  // console.log("savekey:" + key);
  // console.log("JSONbean:" + buildOrderBean());
  sessionStorage.setItem(key, buildOrderBean());
}

function restoreHtml(key) {
  var htmlBean = sessionStorage.getItem(key);
  // console.log("restoreKey:" + key + " ,Parse:" + htmlBean);
  if (htmlBean == null) {
    resetHtml();
  } else {
    realRestoreHtml(htmlBean);
  }
}

function realRestoreHtml(htmlBean) {
  // console.log("json:" + htmlBean)
  orderBean = JSON.parse(htmlBean);
  editSpanText($("#orderId"), orderBean.id, true);
  $("#id").val(orderBean.id);
  $("#accPlat").val(orderBean.ctlId);
  $("#customerName").val(orderBean.cltName);
  $("#platform").val(orderBean.platform);
  $("#tel").val(orderBean.tel);
  $("#address").val(orderBean.address);
  $("#customerRemark").val(orderBean.userRemark);
  $("#transCost").val(orderBean.transCost);
  $("#income").val(orderBean.income);
  $("#recivAccount").val(orderBean.recivAccount);
  $("#cost").val(orderBean.cost);
  subordList = orderBean.subOrder;
  // console.log("restore subordList:" + subordList);
  // 恢复子订单列表数据
  $subordTab.bootstrapTable("load", subordList);
  countOrderInfo();
}

function resetHtml() {
  editSpanText($("#orderId"), "", true);
  $("#accPlat").val("");
  $("#customerName").val("");
  $("#platform").val("");
  $("#tel").val("");
  $("#address").val("");
  $("#customerRemark").val("");
  orderBean = new OrderBean();
  proData = null;
  materialRawViewList = new Array();
  matIndex = 0;
  subordList = new Array();
  $("#orderCost").val("0.0");
  $("#transCost").val("0.0");
  $("#totalCost").val("0.0");
  $("#income").val("0.0");
  $("#recivAccount").val("");
  // 置空子订单列表数据
  $subordTab.bootstrapTable("load", subordList);
}

function buildOrderBean() {
  if (orderBean == null || orderBean == undefined) {
    orderBean = new OrderBean();
  }
  orderBean.id = $("#id").val();
  orderBean.ctlId = $("#accPlat").val();
  orderBean.cltName = $("#customerName").val();
  orderBean.platform = $("#platform").val();
  orderBean.tel = $("#tel").val();
  orderBean.address = $("#address").val();
  orderBean.userRemark = $("#customerRemark").val();
  orderBean.orderCost = $("#orderCost").val();
  orderBean.transCost = $("#transCost").val();
  orderBean.totalCost = $("#totalCost").val();
  orderBean.income = $("#income").val();
  orderBean.recivAccount = $("#recivAccount").val();
  orderBean.subOrder = subordList;

  return JSON.stringify(orderBean);
}

/**
 * 删除子订单
 */
function deleteSuborder() {
  // console.log("deleteSuborder()");
  var ids = $.map($subordTab.bootstrapTable("getSelections"), function(row) {
    return row.uniqueID;
  });
  $subordTab.bootstrapTable("remove", {
    field: "uniqueID",
    values: ids
  });
}

function editSuborder(index) {
  // console.log("index:" + index);
  proData = subordList[index];
  // console.log("editBean:" + editBean);
  $("#selectPro").val(proData.matid);
  $("#materialId").val(proData.matid);
  $("#materialName").val(proData.name);
  $("#curtainWidth").val(proData.curtainWidth);
  $("#curtainHeight").val(proData.curtainHeight);
  $("#materialRemark").val(proData.remarks);
  $("#installPosi").val(proData.installPosi);
  $("#saleNum").val(proData.saleNum);
  // 恢复原料组成列表
  var dataList = proData.strViewList;
  proMatT.bootstrapTable("load", dataList);
  countSubOrdTotalCost();
  // 恢复子订单的图片缩略图
  restorePic(proData.picList);
}

/**
 *
 * @param {子订单中的图片集合} pics
 */
function restorePic(pics) {
  Dropzone.forElement("#myDropzone").removeAllFiles(true);
  if (pics != null && pics.length > 0) {
    picList = pics;
    $.each(pics, function(index, value) {
      var mockFile = { name: value.fileName, size: value.size, status: "success"};
      myDropzone.files.push(mockFile);
      // Call the default addedfile event handler
      myDropzone.emit("addedfile", mockFile);
      // And optionally show the thumbnail of the file:
      // myDropzone.emit("thumbnail", mockFile, "/file/img/"+ value.uuid);
      // Or if the file on your server is not yet in the right
      // size, you can let Dropzone download and resize it
      // callback and crossOrigin are optional.
      myDropzone.createThumbnailFromUrl(
        mockFile,
        "/file/img/" + value.uuid,
        // myDropzone.options.thumbnailWidth,
        // myDropzone.options.thumbnailHeight,
        // function(thumbnail) {
        //   myDropzone.emit("thumbnail", mockFile, thumbnail);
        // }
      );
      myDropzone.emit("thumbnail", mockFile, "/file/img/" + value.uuid);
      // Make sure that there is no progress bar, etc...
      myDropzone.emit("complete", mockFile);
    });
  }
}

/**
 *  重置子订单界面的方法
 */
function resetSuborderModal() {
  // console.log("resetSuborderModal");
  $("#selectPro")
    .val("")
    .trigger("change");
  $("#selectMaterial")
    .val("")
    .trigger("change");
  $("#materialId").val("");
  $("#materialName").val("");
  $("#curtainWidth").val("");
  $("#curtainHeight").val("");
  $("#materialRemark").val("");
  $("#installPosi").val("");
  $("#saleNum").val("");
  proData = null;
  picList = new Array();
  var emptyList = new Array();
  // 重置原料表
  if (isFirstLoadProModal) {
    initProMatTable(emptyList);
    countSubOrdTotalCost();
  } else {
    proMatT.bootstrapTable("load", emptyList);
    countSubOrdTotalCost();
  }
  // 重置dropZone
  if (myDropzone != null) {
    Dropzone.forElement("#myDropzone").removeAllFiles(true);
  }
}

/**
 * 统计订单信息的方法
 */
function countOrderInfo() {
  // console.log("countOrderInfo()");
  var orderCost = 0;
  var totalCost = 0;
  var transCost = $("#transCost").val();
  // 订单的实际成本
  var orderRealCost = 0;
  subordList.forEach(function showData(value, index) {
    orderCost = parseFloat(orderCost) + parseFloat(value.subtotal);
    orderRealCost = parseFloat(orderRealCost) + parseFloat(value.cost);
  });
  totalCost = parseFloat(orderCost) + parseFloat(transCost);
  $("#orderCost").val(orderCost);
  $("#totalCost").val(totalCost);
  $("#cost").val(orderRealCost);
}

/**
 * 提交保存订单
 */
function submitSave() {
  isSave = true;
  $("#orderStatus").val("8");
  // 订单表单提交
  formSubmit();
}

/**
 * 提交确认订单
 */
function submitConfirm() {
  isSave = false;
  $("#orderStatus").val("1");
  formSubmit();
}

function formSubmit() {
  // 展开所有行
  $("#subOrdTab").bootstrapTable("expandAllRows");
  var verifyResult = true;
  // // 订单表单提交
  // if ($("form").parsley().isValid()) {
  //   $("#defaultForm").submit();
  // }
  var parsley_valiation_options = {
    //errorsWrapper: '',
    errorTemplate: '<span class="error-msg"></span>',
    errorClass: "error"
  };
  $("#defaultForm input").parsley(parsley_valiation_options);
  $("#defaultForm input").each(function() {
    if (
      $(this)
        .parsley()
        .validate() !== true
    ) {
      verifyResult = false;
    }
  });
  if (verifyResult) {
    $("#defaultForm").submit();
  }
}
