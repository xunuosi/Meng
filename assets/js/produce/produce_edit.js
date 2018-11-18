var myDropzone;
var orderId;
var orderBean;
// 存放子订单的数组
var subordList = new Array();
var isInitSubOrdTab = true;
var isInitTotalInfoTab = true;
var $prodInfoTab = $("#prodInfoTab");
var $totalInfoTab = $("#totalInfoTab");
var pics;
var orderStrucs;
var isEdit = true;

$(document).ready(function() {
  console.log("manufacter_edit.html");
  Dropzone.autoDiscover = false;
  orderId = sessionStorage.getItem("prodId");
  isEdit = sessionStorage.getItem("isEdit");
  // remove seesion item
  if (orderId != null) {
    sessionStorage.removeItem("prodId");
  }
  $.get("./produces/" + orderId,
    function(result) {
      if (result != null && result.code == 0) {
        initHtml(result.data);
      }
    },
    "json"
  );

  $.get("./produces/getTotalMaterial/" + orderId,
    function(result) {
      if (result != null && result.code == 0) {
        loadTotalConstructTable(result.data);
      }
    },
    "json"
  );
  
  // 表单提交结果
  $("#defaultForm").ajaxForm(function(result) {
    if (result != null && result.code == 0) {
      alert("订单提交成功!");
      // 跳转到指定界面
      gotoSpecificWeb();
    }
  }, "json");
});

function searchManufacter() {
  $("#manufacterTable").bootstrapTable("refresh");
}

function completeSearchManufacter() {
  var row = $("#manufacterTable").bootstrapTable("getSelections");

  $("#manufId").val(row[0].uuid);
  $("#prodAddress").val(row[0].address);
  $("#manufName").val(row[0].name);
  $("#prodOrderStatus").val(0);
  $("#prodMoneyStatus").val(0);

  $("#searchManufacterModal").modal("hide");
}

function initHtml(bean) {
  // 初始化JS插件
  App.tableFilters();
  // 初始化整体界面
  $(".page-title span").text("生产单信息");

  // 初始化页面数据
  setOrderInfo(bean);
  // 事件监听
  eventListener();
}

function setOrderInfo(bean) {
  orderBean = bean;
  // 显示生产订单编号
  editSpanText($("#produceId"), bean.id, true);
  $("#id").val(bean.id);
  $("#orderId").val(bean.orderId);
  // 显示关联订单编号
  editSpanText($("#displayOrderId"), bean.orderId, false);
  // 显示供应商信息
  $("#manufName").val(bean.name);
  $("#manufId").val(bean.manufacturerId);
  $("#prodAddress").val(bean.address);
  // 初始化生产订单状态信息
  $("#prodOrderStatus").val(bean.prodOrderStatus);
  $("#prodMoneyStatus").val(bean.prodMoneyStatus);
  // 设置支付不可用
  if (bean.prodMoneyStatus == "1") {
    setViewBeanEnable($("#payBtn"), false);
    $("#payBtn").text("已支付");
    $("#payBtn").css('color', 'red');
    $("#processingCost").prop('readonly', true);
    $("#processingCost").val(bean.processingCost);
  }

  $("#prodSDate").val(bean.prodStartDate);
  $("#prodEDate").val(bean.doneDate);
  // 根据订单状态设置选择日期控件可用状态
  switch (bean.prodOrderStatus) {
    case "1":
      $('#prodSDate').prop('readonly', true);
      break;
    case "2":
      $('#prodSDate').prop('readonly', true);
      $('#prodEDate').prop('readonly', true);
      break;
  }
  // 不是编辑状态隐藏想要控件
  if (isEdit == "false") {
    $("#confirmEdit").hide();
    $("#payBtn").hide();
    $('#prodSDate').prop('readonly', true);
    $('#prodEDate').prop('readonly', true);
  }

  // 转换子订单的结构
  if (bean.subProOrder != null && bean.subProOrder.length > 0) {
    bean.subProOrder.forEach(function(value, index) {
      value.strViewList = value.subProOrder;
      subordList.push(value);
    });
    initSubOrdTab(subordList);
  }
}

function initSubOrdTab(dataList) {
  isInitSubOrdTab = false;
  $prodInfoTab.bootstrapTable({
    data: dataList,
    detailView: true,
    // toolbar: '#toolbar',
    // clickToSelect: true, //是否启用点击选中行
    columns: [
      {
        field: "matId",
        title: "物料ID",
        visible: false
      },
      {
        field: "suborderId",
        title: "子订单编号"
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
        field: "insPosition",
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
        field: "count",
        title: "产品数量"
      },
      {
        field: "machiningRemark",
        title: "加工备注"
      },
      {
        field: "empty",
        title: "详情",
        formatter: function(value, row, index) {
          var matId = subordList[index].matid;
          if (matId == null) {
            matId = subordList[index].matId;
          }

          var html =
            "<button type='button' class='btn btn-space btn-primary' onclick='getActionOrder(" +
            index +
            ")' data-toggle='modal' data-target='#showPicModal'>样品图</button><input type='hidden' name='subProOrder[" +
            index +
            "].matId' value='" +
            matId +
            "'>";
          return html;
        }
      }
    ],
    //注册加载子表的事件。注意下这里的三个参数！
    onExpandRow: function(index, row, $detail) {
      var subdataList = dataList[index].structList;
      insertSubTable(index, row, $detail, subdataList);
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
        field: "matid",
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
        field: "unit",
        title: "单位"
      },
      {
        field: "machiningCount",
        title: "加工数量"
      },
      {
        field: "machiningRemark",
        title: "加工备注"
      }
    ]
  });
}

/**
 * 根据下标获取
 * @param {操作当前对象列表中的下标} index
 */
function getActionOrder(index) {
  pics = subordList[index].dicFiles;
}

function eventListener() {
  // 模糊动态框监控事件
  $("#showPicModal")
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

      $(".dz-hidden-input").prop("disabled", true);
      // 恢复子订单的图片缩略图
      restorePic(pics);
    });
}

function loadTotalConstructTable(datas) {
  orderStrucs = datas;
  if (isInitTotalInfoTab) {
    initTotalInfoTab(orderStrucs);
  } else {
    $totalInfoTab.bootstrapTable("load", datas);
  }
}

function initTotalInfoTab(dataList) {
  isInitTotalInfoTab = false;
  $totalInfoTab.bootstrapTable({
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
        field: "totalCount",
        title: "数量"
      }
    ]
  });
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

function formSubmit() {
  // 展开所有行
  $("#prodInfoTab").bootstrapTable("expandAllRows");
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
    if ($(this).parsley().validate() !== true) {
      verifyResult = false;
    }
  });

  if (verifyResult) {
    $("#defaultForm").submit();
  }
}

/**
   * 支付加工费
   */
  function payMachFee(payBtn) {
    if ($("#processingCost").parsley().validate() === true) {
      var formatVal = formatNumber($("#processingCost").val(), 2);
      $("#processingCost").val(formatVal);
      // 修改加工费支付状态
      $("#prodMoneyStatus").val("1");
      // 修改界面显示
      $(payBtn).text("已支付");
      $(payBtn).css('color', 'red');
      $(payBtn).prop("disabled", true);
      $("#processingCost").prop("readonly", true);
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

  function cancelSubmit() {
    gotoSpecificWeb();
  }

  function gotoSpecificWeb() {
    myDropzone = null;
    loadPage("html/produce/produce_list.html");
  }

  function setViewBeanEnable(viewBean, enable) {
    if(!enable) {
      viewBean.prop("disabled", true);
    }
  }