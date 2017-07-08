
;(function () {
    'use strict';
    var $form_add_task = $('.add-task')
        , task_list = []
        , $delete_task_button
        , $detail_task_button
        ,current_index
        ,$update_form
        , $detail_task = $('.task-detail')
        ,$task_detail_content
        ,$task_detail_content_input
        ,$checkbox_complete
        ,$msg = $('.msg')
        ,$msg_content = $msg.find('.msg-content')
        ,$msg_confirm = $msg.find('.confirm')
        ,$task_detail_mask = $('.task-detail-mask');
    init();

    $form_add_task.on('submit', function (e) {
        var new_task = {};
        /* 禁用默认行为*/
        e.preventDefault();
        /* 获取新TASK的值*/
        new_task.content = $(this).find('input[name=content]').val();
        /*如果值为空则返回*/
        if (!new_task.content) return;
        /*存入新的TASK*/
        if (add_task(new_task)) {
            render_task_list();
            $(this).find('input[name=content]').val(null);
        }
    });
    /* 监听事件，防止执行一次后失效 */
    function  listen_msg() {
        $msg_confirm.on('click',function () {
            hide_notify();
        })
    }
    function  listion_task_delete() {
        $delete_task_button.on('click', function () {
            var $this = $(this);
            /* 找到父元素再删除 */
            var $item = $this.parent();
            var index = $item.data('index');
            /* 弹出确认框 */
            var tmp = confirm('确定删除?');
            tmp ? delete_task(index) : null;
        })
    }
    $task_detail_mask.on('click', hide_task_detail);

    function listion_task_detail() {
        var index;
        $('.task-item').on('dblclick', function () {
            index = $(this).data('index');
            show_task_detail(index);
        });
        $detail_task_button.on('click', function () {
            var $this = $(this);
            var $item = $this.parent();
            index = $item.data('index');
            show_task_detail(index);
        })
    }
    /* 监听完成事件 */
    function listen_checkbox_complete() {
        $checkbox_complete.on( 'click', function () {
            var $this = $(this);
           /* var is_complete = $this.is(':checked');*/
            var index = $this.parent().parent().data('index');
            var item = store.get('task_list')[index];
            if (item.complete) {
                update_task(index, {complete: false});
               /* $this.prop('checked', true);*/
            } else
            {
                update_task(index, {complete: true});
                /*$this.prop('checked', false)*/
            }
            })
    }
    
    /* 点击详细显示详细信息 */
    function show_task_detail(index) {
        /* 生成详情模板 */
        render_task_detail(index);
        current_index = index;
        /* 显示详情模板 */
        $detail_task.show();
        $task_detail_mask.show();
    }
    /* 更新TASK */
    function update_task(index,data) {
        if(!index || !task_list[index]) return;
        task_list[index] = $.extend({},task_list[index],data);
        refresh_task_list();
    }
    /* 隐藏详情框 */
    function hide_task_detail() {
        $detail_task.hide();
        $task_detail_mask.hide();
    }

    /*添加TASK*/
    function add_task(new_task) {
        task_list.push(new_task);
        /*更新  store.set*/
        store.set('task_list',task_list);
        return true;
    }
    
    /*删除TASK*/
    function delete_task(index) {
        /*若没有index或者index不存在，返回*/
        if(index === undefined || !task_list[index]) return;
        delete task_list[index];
        /* 更新list */
        refresh_task_list();
    }
    /* 刷新localstorage数据并更新view */
    function  refresh_task_list() {
        store.set('task_list',task_list);
        render_task_list();
    }
    /*初始化*/
    function init() {
        /*防止为空不执行*/
        task_list = store.get('task_list') || [];
        /*如果存在数据，则渲染全局，执行下列方法*/
        if(task_list.length) {
            render_task_list();
        }
        task_remind_check();
        listen_msg();
    }
    function task_remind_check() {
        /* 时间戳 */
        var current_timestamp;
        var itl = setInterval(function () {
            for (var i = 0; i < task_list.length; i++){
                var item = store.get('task_list')[i], task_timestamp;
                if(!item || !item.remind_date ||item.informed)
                    continue;
                current_timestamp = (new Date()).getTime();
                task_timestamp = (new Date(item.remind_date)).getTime();
                if (current_timestamp - task_timestamp >= 1){
                    update_task(i, {informed:true});
                    notify(item.content);
                }
            }
        }, 300);
    }
    function notify(msg) {
        $msg_content.html(msg);
        $msg.show();
        console.log('1',1);
    }
    function hide_notify() {
        $msg.hide();
    }
    /* 渲染全部TASK并显示 */
    function render_task_list() {
        var $task_list = $('.task-list');
        $task_list.html('');
        var complete_item = [];
        for(var i= 0; i < task_list.length; i++){
            var item = task_list[i];
            if (item && item.complete)
            {
                complete_item[i] = item;
            } else
                {
                var $task = render_task_tpl(item, i);
                $task_list.prepend($task);
                }
        }
        for (var j = 0; j < complete_item.length; j++) {
            $task = render_task_tpl(complete_item[j], j);
            if(!$task) continue;
            $task.addClass('completed');
            $task_list.append($task);
        }

        /* 事件监听，防止只执行一次 */
        $delete_task_button = $('.action.delete');
        $detail_task_button = $('.action.detail');
        $checkbox_complete = $('.task-list .complete[type=checkbox]');
        listion_task_delete();
        listion_task_detail();
        listen_checkbox_complete();
    }
    /* 渲染单条TASK */
    function render_task_tpl(data, index) {
        if (!index || !data) return;
        var list_item_tpl =
            '<div class="task-item" data-index="' + index + '">'+
            '<span><input type="checkbox" '+ (data.complete ? 'checked' : '')+' class="complete"></span>'+
            '<span class="task-content">' + data.content + '</span>'+
            '<span class="action delete">删除</span>'+
            '<span class="action detail">详细</span>'+
            '</div>';
        return $(list_item_tpl);
    }
    /* 渲染制定TASK的详细信息*/
    function render_task_detail(index) {
        if(index === undefined || !task_list[index]) return;
        var item = task_list[index];
        var tpl =
            '<form>'+
            '<div class="content">'
             + item.content +
            '</div>'+
            '<div class="input-item">' +
            '<input type="text" name="content" value="' + (item.content || '')+ '" style="display: none">' +
            '</div>'+
                '<div class="desc input-item">'+
                    '<textarea name="desc" >'+ (item.desc || '') +'</textarea>'+
                '</div>'+
                '<div class="remind" class="input-item">'+
                    '<label>提醒时间:</label>'+
                    '<input type="text" name="remind_date" value="'+ (item.remind_date || '')+'" class="datetime">'+
                    '<button type="submit" class="input-item">更新</button>'+
                 '</div>'+
             '<form>';
        /* 清空详情模板 */
        $detail_task.html(null);
        /* 向详情模板添加内容*/
        $detail_task.html(tpl);
        $('.datetime').datetimepicker();
        /* 选择form元素以便监听submit*/
        $update_form = $detail_task.find('form');
        $task_detail_content = $update_form.find('.content');
        $task_detail_content_input = $update_form.find('input[name=content]');
        /* 双击标题修改 */
        $task_detail_content.on('dblclick', function () {
            $task_detail_content.hide();
            $task_detail_content_input.show();
        });
        $update_form.on('submit', function (e) {
            e.preventDefault();
            var data = {};
            data.content = $(this).find('[name = content]').val();
            data.desc = $(this).find('[name = desc]').val();
            data.remind_date = $(this).find('[name = remind_date]').val();
            update_task(index, data);
            hide_task_detail();
        })
    }
})();

