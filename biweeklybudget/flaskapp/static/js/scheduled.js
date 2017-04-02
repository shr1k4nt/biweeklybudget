/*
The latest version of this package is available at:
<http://github.com/jantman/biweeklybudget>

################################################################################
Copyright 2016 Jason Antman <jason@jasonantman.com> <http://www.jasonantman.com>

    This file is part of biweeklybudget, also known as biweeklybudget.

    biweeklybudget is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    biweeklybudget is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with biweeklybudget.  If not, see <http://www.gnu.org/licenses/>.

The Copyright and Authors attributions contained herein may not be removed or
otherwise altered, except to add the Author attribution of a contributor to
this work. (Additional Terms pursuant to Section 7b of the AGPL v3)
################################################################################
While not legally required, I sincerely request that anyone who finds
bugs please submit them at <https://github.com/jantman/biweeklybudget> or
to me via email, and that you send any contributions or improvements
either as a pull request on GitHub, or to me via email.
################################################################################

AUTHORS:
Jason Antman <jason@jasonantman.com> <http://www.jasonantman.com>
################################################################################
*/

// for the DataTable
var mytable;

/**
 * Handle change of the "Type" radio buttons on the modal
 */
function modalDivHandleType() {
    if($('#sched_frm_type_monthly').is(':checked')) {
        $('#sched_frm_group_monthly').show();
        $('#sched_frm_group_num_per_period').hide();
        $('#sched_frm_group_date').hide();
    } else if($('#sched_frm_type_per_period').is(':checked')) {
        $('#sched_frm_group_monthly').hide();
        $('#sched_frm_group_num_per_period').show();
        $('#sched_frm_group_date').hide();
    } else {
        $('#sched_frm_group_monthly').hide();
        $('#sched_frm_group_num_per_period').hide();
        $('#sched_frm_group_date').show();
    }
}

/**
 * Generate the HTML for the form on the Modal
 */
function modalDivForm() {
    var frm = '<form role="form" id="schedForm">';
    // id
    frm += '<input type="hidden" id="sched_frm_id" name="id" value="">\n';
    // description
    frm += '<div class="form-group"><label for="sched_frm_description" class="control-label">Description</label><input class="form-control" id="sched_frm_description" name="description" type="text"></div>\n';
    // type
    frm += '<div class="form-group"><label class="control-label">Type </label> ';
    frm += '<label class="radio-inline" for="sched_frm_type_monthly"><input type="radio" name="type" id="sched_frm_type_monthly" value="monthly" onchange="modalDivHandleType()" checked>Monthly</label>';
    frm += '<label class="radio-inline" for="sched_frm_type_per_period"><input type="radio" name="type" id="sched_frm_type_per_period" value="per_period" onchange="modalDivHandleType()">Per Period</label>';
    frm += '<label class="radio-inline" for="sched_frm_type_date"><input type="radio" name="type" id="sched_frm_type_date" value="date" onchange="modalDivHandleType()">Date</label>';
    frm += '</div>\n';
    // recurrence - monthly
    frm += '<div class="form-group" id="sched_frm_group_monthly">';
    frm += '<label for="sched_frm_day_of_month" class="control-label">Day of Month</label><input class="form-control" id="sched_frm_day_of_month" name="day_of_month" type="text" size="4" maxlength="2">';
    frm += '</div>\n';
    // recurrence - per period
    frm += '<div class="form-group" id="sched_frm_group_num_per_period" style="display: none;">';
    frm += '<label for="sched_frm_num_per_period" class="control-label">Number Per Pay Period</label><input class="form-control" id="sched_frm_num_per_period" name="num_per_period" type="text" size="4" maxlength="2">';
    frm += '</div>\n';
    // recurrence - date
    frm += '<div class="form-group" id="sched_frm_group_date" style="display: none;">';
    frm += '<label for="sched_frm_date" class="control-label">Specific Date</label><div class="input-group date" id="sched_frm_group_date_input"><span class="input-group-addon"><i class="fa fa-calendar fa-fw"></i></span><input class="form-control" id="sched_frm_date" name="date" type="text" size="12" maxlength="10"></div>';
    frm += '</div>\n';
    // amount
    frm += '<div class="form-group"><label for="sched_frm_amount" class="control-label">Amount</label><div class="input-group"><span class="input-group-addon">$</span><input type="text" class="form-control" id="sched_frm_amount" name="amount"></div></div>\n';
    // account
    frm += '<div class="form-group"><label for="sched_frm_account" class="control-label">Account</label>';
    frm += '<select id="sched_frm_account" name="account" class="form-control">';
    frm += '<option value="None" selected="selected"></option>';
    Object.keys(acct_names_to_id).forEach(function (key) {
        frm += '<option value="' + acct_names_to_id[key] + '">' + key + '</option>';
    });
    frm += '</select>';
    frm += '</div>\n';
    // budget
    frm += '<div class="form-group"><label for="sched_frm_budget" class="control-label">Budget</label>';
    frm += '<select id="sched_frm_budget" name="budget" class="form-control">';
    frm += '<option value="None" selected="selected"></option>';
    Object.keys(budget_names_to_id).forEach(function (key) {
        frm += '<option value="' + budget_names_to_id[key] + '">' + key + '</option>';
    });
    frm += '</select>';
    frm += '</div>\n';
    // notes
    frm += '<div class="form-group"><label for="sched_frm_notes" class="control-label">Notes</label><input class="form-control" id="sched_frm_notes" name="notes" type="text"></div>\n';
    // is_active checkbox
    frm += '<div class="form-group"><label class="checkbox-inline control-label" for="sched_frm_active"><input type="checkbox" id="sched_frm_active" name="is_active" checked> Active?</label>\n';
    frm += '</form>\n';
    return frm;
}

/**
 * Ajax callback to fill in the modalDiv with data on a budget.
 */
function modalDivFillAndShow(msg) {
    $('#modalLabel').text('Edit Scheduled Transaction ' + msg['id']);
    $('#sched_frm_id').val(msg['id']);
    $('#sched_frm_description').val(msg['description']);
    if(msg['date'] != null) {
        $('#sched_frm_type_monthly').prop('checked', false);
        $('#sched_frm_type_per_period').prop('checked', false);
        $('#sched_frm_type_date').prop('checked', true);
        $('#sched_frm_date').val(msg['date']['str']);
    } else if(msg['day_of_month'] != null) {
        $('#sched_frm_type_per_period').prop('checked', false);
        $('#sched_frm_type_date').prop('checked', false);
        $('#sched_frm_type_monthly').prop('checked', true);
        $('#sched_frm_day_of_month').val(msg['day_of_month']);
    } else {
        // num_per_period
        $('#sched_frm_type_monthly').prop('checked', false);
        $('#sched_frm_type_date').prop('checked', false);
        $('#sched_frm_type_per_period').prop('checked', true);
        $('#sched_frm_num_per_period').val(msg['num_per_period']);
    }
    modalDivHandleType();
    $('#sched_frm_amount').val(msg['amount']);
    $('#sched_frm_account option[value=' + msg['account_id'] + ']').prop('selected', 'selected').change();
    $('#sched_frm_budget option[value=' + msg['budget_id'] + ']').prop('selected', 'selected').change();
    $('#sched_frm_notes').val(msg['notes']);
    if(msg['is_active'] === true) {
        $('#sched_frm_active').prop('checked', true);
    } else {
        $('#sched_frm_active').prop('checked', false);
    }
    $("#modalDiv").modal('show');
}

/**
 * Show the modal popup, populated with information for one ScheduledTransaction
 */
function schedModal(id) {
    $('#modalBody').empty();
    $('#modalBody').append(modalDivForm());
    $('#sched_frm_group_date_input').datepicker({
        todayBtn: "linked",
        autoclose: true,
        todayHighlight: true,
        format: 'yyyy-mm-dd'
    });
    $('#modalSaveButton').show();
    if(id) {
        var url = "/ajax/scheduled/" + id;
        $.ajax(url).done(modalDivFillAndShow);
    } else {
        $('#modalLabel').text('Add New Scheduled Transaction');
        $("#modalDiv").modal('show');
    }
}

$('#modalSaveButton').click(function() {
    handleForm('modalBody', 'schedForm', '/forms/scheduled', mytable);
});

$('#btn_add_sched').click(function() {
    schedModal();
});

$(document).ready(function() {
    mytable = $('#table-scheduled-txn').dataTable({
        processing: true,
        serverSide: true,
        ajax: "/ajax/scheduled",
        columns: [
            {
                data: "is_active",
                "render": function(data, type, row) {
                    if (type === "display" || type === "filter") {
                        if (data === false) {
                            return '<span style="color: #a94442;">NO</span>';
                        }
                        return 'yes';
                    }
                    return data;
                }
            },
            { data: "schedule_type" },
            { data: "recurrence_str" },
            {
                data: "amount",
                "render": function(data, type, row) {
                    return type === "display" || type === "filter" ?
                        '$' + data.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") :
                        data;
                }
            },
            {
                data: "description",
                "render": function(data, type, row) {
                    return $("<div>").append($("<a/>").attr("href", "javascript:schedModal(" + row.DT_RowData.id + ")").text(data)).html();
                }
            },
            {
                data: "account",
                "render": function(data, type, row) {
                    return $("<div>").append($("<a/>").attr("href", "/accounts/" + row.DT_RowData.acct_id).text(data)).html();
                }
            },
            {
                data: "budget",
                "render": function(data, type, row) {
                    return $("<div>").append($("<a/>").attr("href", "/budgets/" + row.DT_RowData.budget_id).text(data)).html();
                }
            }
        ],
        order: [[ 0, "desc"], [ 1, "desc"], [2, "asc"]],
        bInfo: true,
        "fnRowCallback": function(nRow, aData, iDisplayIndex, iDisplayIndexFull) {
            if(aData.is_active === false) {
                $(nRow).addClass('inactive');
            }
        }
    });

    $('#table-scheduled-txn_length').parent().removeClass('col-sm-6');
    $('#table-scheduled-txn_length').parent().addClass('col-sm-4');
    $('#table-scheduled-txn_filter').parent().removeClass('col-sm-6');
    $('#table-scheduled-txn_filter').parent().addClass('col-sm-4');
    var acctsel = '<div class="col-sm-4"><div id="table-scheduled-txn_acct_filter" class="dataTables_length"><label>Type: <select name="type_filter" id="type_filter" class="form-control input-sm" aria-controls="table-scheduled-txn"><option value="None" selected="selected"></option><option value="date">Date</option><option value="monthly">Monthly</option><option value="per period">Per Period</option>';
    acctsel += '</select></label></div></div>';
    $(acctsel).insertAfter($('#table-scheduled-txn_length').parent());
    $('#type_filter').on('change', function() {
        var selectedVal = $(this).val();
        mytable.fnFilter(selectedVal, 1, false);
    });
});
