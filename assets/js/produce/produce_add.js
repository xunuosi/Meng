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

$(document).ready(function() {
  console.log("manufacter_add.html");
  Dropzone.autoDiscover = false;
  orderId = sessionStorage.getItem("orderId");
  // remove seesion item
  if (orderId != null) {
    sessionStorage.removeItem("orderId");
  }
  $.get(
    "./sellOrders/" + orderId,
    function(result) {
      if (result != null && result.code == 0) {
        initHtml(result.data);
      }
    },
    "json"
  );

  $.get(
    "./sellOrders/getTotalMaterial/" + orderId,
    function(result) {
      if (result != null && result.code == 0) {
        loadTotalConstructTable(result.data);
      }
    },
    "json"
  );
  // 初始化加工商表格
  $("#manufacterTable").bootstrapTable({
    locale: "zh-CN",
    url: "./manufacturers",
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
        AND_LIKE_name: $("#searchManufacterCondition").val()
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
        title: "加工商名称"
      },
      {
        field: "address",
        title: "加工商地址"
      },
      {
        field: "tel",
        title: "tel",
        visible: false
      }
    ]
  });
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
  $(".page-title span").text("新增生产单");
  // 初始化页面数据
  setOrderInfo(bean);
  // 事件监听
  eventListener();
}

function setOrderInfo(bean) {
  orderBean = bean;
  // 显示关联订单编号
  editSpanText($("#displayOrderId"), bean.id, false);
  // 订单ID
  $("#orderId").val(bean.id);
  // 转换子订单的结构
  if (bean.subOrderView != null && bean.subOrderView.length > 0) {
    bean.subOrderView.forEach(function(value, index) {
      value.strViewList = value.structList;
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
        field: "matid",
        title: "物料ID",
        visible: false
      },
      {
        field: "id",
        title: "子订单编号",
        formatter: function(value, row, index) {
          var html =
            "<span>" +
            value +
            "</span><input type='hidden' name='subProOrder[" +
            index +
            "].suborderId' value='" +
            value +
            "'>";

          return html;
        }
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
            "</span><input type='hidden' name='subProOrder[" +
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
            "</span><input type='hidden' name='subProOrder[" +
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
            "</span><input type='hidden' name='subProOrder[" +
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
            "</span><input type='hidden' name='subProOrder[" +
            index +
            "].count' value='" +
            value +
            "'>";
          return html;
        }
      },
      {
        field: "remarks",
        title: "加工备注",
        formatter: function(value, row, index) {
          var machRemark = value;
          if (machRemark == null) {
            machRemark = dataList[index].machRemark;
          }
          var html =
            "<span>" +
            machRemark +
            "</span><input type='hidden' name='subProOrder[" +
            index +
            "].machiningRemark' value='" +
            machRemark +
            "'>";
          return html;
        }
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
      var subdataList = dataList[index].strViewList;
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
        field: "rawid",
        title: "物料ID",
        formatter: function(value, row, index) {
          var matIdValue = value;
          if (matIdValue == null) {
            matIdValue = dataList[index].matId;
          }
          var html =
            "<span>" +
            matIdValue +
            "</span><input type='hidden' name='subProOrder[" +
            indexP +
            "].structList[" +
            index +
            "].matid' value='" +
            matIdValue +
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
        field: "unit",
        title: "单位"
      },
      {
        field: "total",
        title: "数量",
        formatter: function(value, row, index) {
          var html =
            "<span>" +
            value +
            "</span><input type='hidden' name='subProOrder[" +
            indexP +
            "].structList[" +
            index +
            "].originCount' value='" +
            value +
            "' form='defaultForm'>";
          return html;
        }
      },
      {
        field: "machCount",
        title: "加工数量",
        formatter: function(value, row, index) {
          if (value == null) {
            value = dataList[index].total;
          }
          var html =
            "<input class='targetMachTotal' id='machTotal" +
            index +
            "' type='text' name='subProOrder[" +
            indexP +
            "].structList[" +
            index +
            "].machiningCount' value='" +
            value +
            "' onchange='updateExpandTabCell(this," + indexP + "," + index + "," + "\"machCount\"" + ")' data-parsley-trigger='input' data-parsley-type='number' data-parsley-error-message='只能输入整数' required>";
          return html;
        }
      },
      {
        field: "machCost",
        title: "加工费",
        formatter: function(value, row, index) {
          if (value == null) {
            value = 0;
          }
          var html =
            "<input id='machCost" +
            index +
            "' type='text' name='subProOrder[" +
            indexP +
            "].structList[" +
            index +
            "].machCost' value='" +
            value +
            "' onchange='updateExpandTabCell(this," + indexP + "," + index + "," + "\"machCost\"" + ")' data-parsley-trigger='input' data-parsley-type='number' step='0.01' data-parsley-error-message='只能输入2位小数' required>";
          return html;
        },
        visible: false
      },
      {
        field: "machRemark",
        title: "加工备注",
        formatter: function(value, row, index) {
          var html =
            "<input id='macRemark" +
            index +
            "' name=subProOrder[" +
            indexP +
            "].structList[" +
            index +
            "].machRemark" +
            " value='" +
            value +
            "' onchange='updateExpandTabCell(this," + indexP + "," + index + "," + "\"machRemark\"" + ")' type='text'/>";

          return html;
        }
      }
    ]
  });
}

/**
 * 更新扩展表格的方法
 * @param {*} indexP 
 * @param {*} index 
 */
function updateExpandTabCell(view, indexP, index, propertyName) {
  var updateValue = view.value;
  switch (propertyName) {
    case "machRemark":
      subordList[indexP].strViewList[index].machRemark = updateValue;
      break;
    case "machCount":
      subordList[indexP].strViewList[index].machCount = updateValue;
      break;
    case "machCost":
      subordList[indexP].strViewList[index].machCost = updateValue;
      break;  
    default:
      break;
  }
  
  // console.log("updateExpandTabCell");
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
  // 加工数量改变时的事件监控
  $("#prodInfoTab").unbind("expand-row.bs.table").on("expand-row.bs.table", function(index, row, $detail) {
      $(".targetMachTotal").unbind("focusin").on("focusin", function() {
          $(this).data("val", $(this).val());
        }).unbind("change").on("change", function() {
          var prev = $(this).data("val");
          var current = $(this).val();
          // 获取input所在的tr元素
          var matId = $(this).closest("tr").find("td:first").text();
          recountTotalInfo(prev, current, matId);
        });
    });
}

function recountTotalInfo(prev, current, matId) {
  var result = parseInt(current) - parseInt(prev);
  $.each(orderStrucs, function(index, value) {
    if (value.matId == matId) {
      var final = parseInt(value.totalCount) + parseInt(result);
      value.totalCount = final;
    }
  });
  loadTotalConstructTable(orderStrucs);
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

  function gotoSpecificWeb() {
    myDropzone = null;
    loadPage("html/produce/produce_list.html");
  }