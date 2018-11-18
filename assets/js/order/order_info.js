// 存储子订单缩略图的数组
var picList = new Array();
var orderBean;
var suborderBean;
var suborderList;
var orderId;
var matchStyleSelectList = new Array();
var orderStatusList = new Array();
var $subordTab = $("#subOrdTab");
var myDropzone;
var $proMatTable = $("#proMatTable");
var isFirstLoadData = true;

$(document).ready(function() {
  console.log("sellOrder_info.html");
  Dropzone.autoDiscover = false;

  orderId = storage.getItem("orderId");
  $.get(
    "./sellOrders/" + orderId,
    function(result) {
      if (result != null && result.code == 0) {
        orderBean = result.data;
        initHtml(orderBean);
      }
    },
    "json"
  );
  // 获取加工方式列表数据
  getDicList("machStyle", matchStyleSelectList);
  // 获取订单状态列表数据
  getDicList("orderStatus", orderStatusList);
});

function initHtml(bean) {
  // 监听事件
  eventListener();
  // 设置当前tab标签
  $("#orderTab .active").text(bean.cltName);
  editSpanText($("#orderId"), bean.id, true);
  // 初始化整体界面
  $(".page-title span").text("订单信息");
  // 初始化订单状态
  editSpanText(
    $("#showOrderStatus"),
    getDicNameByCode(bean.orderStatus, orderStatusList),
    false
  );
  setOrderInfo(bean);
}

function eventListener() {
  // 模糊动态框监控事件
  $("#addProductModal")
    .unbind("shown.bs.modal")
    .on("shown.bs.modal", function(e) {
      if (myDropzone == null) {
        myDropzone = new Dropzone("#myDropzone", {
          url: "/file/upload",
          dictDefaultMessage: "无预览图片",
          acceptedFiles: "image/*",
          autoProcessQueue: false
        });
      }
      // $("#myDropzone").unbind('click');
      // dropZoneJs不可点击
      $(".dz-hidden-input").prop("disabled",true);
      // 恢复子订单的图片缩略图
      restorePic(suborderBean.dicFiles);
      countSubOrdTotalCost();
    });
}

function setOrderInfo(bean) {
  $("#accPlat").val(bean.ctlId);
  $("#customerName").val(bean.cltName);
  $("#platform").val(bean.platform);
  $("#tel").val(bean.tel);
  $("#address").val(bean.address);
  $("#customerRemark").val(bean.userRemark);
  $("#recoSendDate").val(bean.recoSendDate);
  $("#orderCost").val(bean.orderCost);
  $("#transCost").val(bean.transCost);
  $("#totalCost").val(bean.totalCost);
  $("#income").val(bean.income);
  $("#recivAccount").val(bean.recivAccount);

  editPText($("#approvDate"), bean.approOrdDate, false);
  editPText($("#delivrDate"), bean.transDate, false);
  editPText($("#approvPerson"), bean.approOrdPerson, false);
  editPText($("#delivrPerson"), bean.transPerson, false);
  editPText($("#confirmDate"), bean.confmOrdDate, false);
  editPText($("#editDate"), bean.mOrdDate, false);
  editPText($("#createDate"), bean.cOrdDate, false);
  editPText($("#confrimPerson"), bean.confmOrdPerson, false);
  editPText($("#editPerson"), bean.mOrdPerson, false);
  editPText($("#createPerson"), bean.cOrdPerson, false);

  suborderList = bean.subOrderView;

  initSubOrdTab(suborderList);
}

function initSubOrdTab(dataList) {
  $subordTab.bootstrapTable({
    data: dataList,
    detailView: true,
    // toolbar: '#toolbar',
    // clickToSelect: true, //是否启用点击选中行
    columns: [
      {
        field: "name",
        title: "成品名称",
        formatter: function(value, row, index) {
          if (value == null) {
            value = "非成品";
          }
          var html = "<span>" + value + "</span>";
          return html;
        }
      },
      {
        field: "internalId",
        title: "内部ID",
        formatter: function(value, row, index) {
          if (value == "-1") {
            value = "-";
          }
          var html = "<span>" + value + "</span>";
          return html;
        }
      },
      {
        field: "installPosi",
        title: "安装位置"
      },
      {
        field: "curtainWidth",
        title: "窗帘宽度"
      },
      {
        field: "curtainHeight",
        title: "窗帘高度"
      },
      {
        field: "saleNum",
        title: "产品数量"
      },
      {
        field: "subtotal",
        title: "子订单金额"
      },
      {
        field: "currentStatus",
        title: "当前状态",
        formatter: function(value, row, index) {
          var html =
            "<span>" + getDicNameByCode(value, orderStatusList) + "</span>";
          return html;
        }
      },
      {
        field: "machRemark",
        title: "加工备注"
      },
      {
        field: "empty",
        title: "操作",
        formatter: function(value, row, index) {
          var html =
            "<button type='button' class='btn btn-space btn-primary' onclick='getSuborder(" +
            index +
            ")' data-toggle='modal' data-target='#addProductModal'>详情</button>";
          return html;
        }
      }
    ],
    //注册加载子表的事件。注意下这里的三个参数！
    onExpandRow: function(index, row, $detail) {
      var subTabData = dataList[index].structList;
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
        field: "matId",
        title: "物料ID"
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
        title: "数量"
      },
      {
        field: "unit",
        title: "单位"
      },
      {
        field: "sellPrice",
        title: "单价"
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
            "</span>";
          return html;
        }
      },
      {
        field: "machFee",
        title: "加工费"
      },
      {
        field: "calTotal",
        title: "合计",
        formatter: function(value, row, index) {
          var sellPrice = dataList[index].sellPrice;
          var total = dataList[index].total;
          var machFee = dataList[index].machFee;
          var sum =
            Number.parseFloat(sellPrice) * Number.parseFloat(total) +
            Number.parseFloat(machFee);
          var formatSum = formatNumber(sum.toString(), 2);
          var html = "<span>" + formatSum + "</span>";
          return html;
        }
      },
      {
        field: "machRemark",
        title: "加工备注"
      }
    ]
  });
}

/**
 * 取消提交的方法
 */
function cancelSubmit() {
  // 当前订单界面只有唯一订单,跳转到订单列表界面
  changeMenu("html/order/sellOrder_list.html");
  // 清空当前界面变量
  myDropzone = null;
}

function editSpanText(viewBean, str, isReset) {
  if (isReset) {
    viewBean.text(str);
  } else {
    var temp = viewBean.text();
    viewBean.text(temp + str);
  }
}

function editPText(viewBean, str, isReset) {
  if (str == null) {
    return;
  }
  if (isReset) {
    viewBean.text(str);
  } else {
    var temp = viewBean.text();
    viewBean.text(temp + str);
  }
}

function getSuborder(index) {
  // console.log("index:" + index);
  suborderBean = suborderList[index];
  // console.log("editBean:" + editBean);
  $("#materialId").val(suborderBean.matId);
  $("#materialName").val(suborderBean.name);
  $("#curtainWidth").val(suborderBean.curtainWidth);
  $("#curtainHeight").val(suborderBean.curtainHeight);
  $("#materialRemark").val(suborderBean.machRemark);
  $("#installPosi").val(suborderBean.installPosi);
  $("#saleNum").val(suborderBean.saleNum);
  // 恢复原料组成列表
  var dataList = suborderBean.structList;
  if (isFirstLoadData) {
    initProMatTable(dataList);
  } else {
    $proMatTable.bootstrapTable("load", dataList);
  }
}

/**
 *
 * @param {子订单中的图片集合} pics
 */
function restorePic(pics) {
  Dropzone.forElement("#myDropzone").removeAllFiles(true);
  if (pics != null && pics.length > 0 && pics[0].fileUuid != "") {
    picList = pics;
    $.each(pics, function(index, value) {
      var mockFile = {
        status: "success"
      };
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
        "/file/img/" + value.fileUuid
        // myDropzone.options.thumbnailWidth,
        // myDropzone.options.thumbnailHeight,
        // function(thumbnail) {
        //   myDropzone.emit("thumbnail", mockFile, thumbnail);
        // }
      );
      myDropzone.emit("thumbnail", mockFile, "/file/img/" + value.fileUuid);
      // Make sure that there is no progress bar, etc...
      myDropzone.emit("complete", mockFile);
    });
  }
}


/**
 *   初始化产品组成列表的方法
 */
function initProMatTable(dataList) {
  isFirstLoadData = false;
  $proMatTable.bootstrapTable({
    data: dataList,
    // toolbar: '#toolbar',
    // clickToSelect: true, //是否启用点击选中行
    columns: [
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
        title: "数量"
      },
      {
        field: "unit",
        title: "单位",
        visible: true
      },
      {
        field: "sellPrice",
        title: "单价"
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
            "</span>";
          return html;
        }
      },
      {
        field: "machFee",
        title: "加工费"
      },
      {
        field: "calTotal",
        title: "合计",
        formatter: function(value, row, index) {
          var sellPrice = dataList[index].sellPrice;
          var num = dataList[index].total;
          var machFee = dataList[index].machFee;
          var sum = sellPrice * num;
          sum = parseFloat(sum) + parseFloat(machFee);
          sum = formatNumber(sum.toString(), 2);
          
          dataList[index].calTotal = sum;
          var html =
            "<span>" +
              sum +
            "</span>";
          return html;
        }
      },
      {
        field: "machRemark",
        title: "加工备注"
      }
    ]
  });
}

/**
 *   计算当前子订单的合计金额
 **/
function countSubOrdTotalCost() {
  var allTableData = $proMatTable.bootstrapTable("getData"); //获取表格的所有内容行
  var sum = 0;
  if (allTableData != null) {
    for (let index = 0; index < allTableData.length; index++) {
      const rowBean = allTableData[index];
      // alert(rowBean.calTotal);
      sum = parseFloat(sum) + parseFloat(rowBean.calTotal);
    }
  }

  $("#subtotal").val(sum);
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