/*
 * popup.htmlのボタン動作
 */

// 即時関数
$(function(){

    // 現在開いているChromeタブについての処理
    chrome.tabs.getSelected(window.id, function(tab){

        // 画像URLを格納する配列
        var imageUrls = [];

        // 画像をプリロードする
        jQuery.preloadImages = function() {
            for(var i=0; i<arguments.length; i++){
                $("img", self).each(function(){
                    var img = new Image();
                    img.src = arguments[i];
                });
            }
        };
        /*
         * 画像エクスポート処理を行う即時関数
         */
        (function() {
            var defer = $.Deferred();

            // 現在のURLの表示
            $("#current_url").text("URL : " + tab.url);

            // エクスポート準備
            chrome.runtime.sendMessage({
                msg: "prepare",
                url: tab.url
            },
            function(response) {
                // エクスポート可能な画像の枚数の確認を行う
                $("#num_of_images").text("画像が" + response.numImages + "枚見つかりました");
                if (response.numImages == 0) {
                    $("#status").text("エクスポート可能な画像がありません");
                }
                defer.resolve(response.imageUrls);
            });

            return defer.promise();

        })()

        // 画像の候補の一覧を表示する
        .then(function(imageUrls){
            var defer = $.Deferred();

            // 画像のプリロードを行う
            $.preloadImages(imageUrls);

            // 画像候補をテーブルに格納する
            var trTag;
            for(var i=0; i<imageUrls.length; i++) {
                if (i%3 == 0) {
                    trTag = $("<tr></tr>").appendTo("#candidates");
                }

                var tdTag = $("<td></td>").attr({
                    id: i,
                    class: "thumbnail_block"
                })
                trTag.append(tdTag);

                var imgTag = $("<img />").attr({
                    id: i,
                    class: "thumbnail",
                    src: imageUrls[i]
                })
                tdTag.append(imgTag);

            }

            return defer.promise();

        });

        // DL候補画像のDLの切り替え
        $(document).on("click", "img.thumbnail", function(imageUrls){
            // 画像元のURL
            var src = $(this).prop("src");

            // 透明度の設定
            if ($(this).css("opacity") == 1.0) {
                $(this).fadeTo(500, 0.2);  // フェードアウト
            } else {
                $(this).fadeTo(500, 1.0);  // フェードイン
            }
        });

        // エクスポートボタンを押した際の処理
        $("#start_export").click(function(){

            // 対象の画像URLを取得する
            var imageUrls = [];
            $("img.thumbnail").each(function(){
                if ($(this).css("opacity") == 1.0) {
                    imageUrls.push($(this).prop("src"));
                }
            });

            // backgroundへの処理要求
            chrome.runtime.sendMessage({
                msg: "export",
                imageUrls: imageUrls
            },
            function(response) {
                if (response.numImages > 1) {
                     $("#status").text("画像は1枚だけエクスポートできます");
                }
            });

        });

        // ダウンロードボタンを押した際の処理
        $("#start_download").click(function(){

            // 対象の画像URLを取得する
            var imageUrls = [];
            $("img.thumbnail").each(function(){
                if ($(this).css("opacity") == 1.0) {
                    imageUrls.push($(this).prop("src"));
                }
            });

            // backgroundへの処理要求
            chrome.runtime.sendMessage({
                msg: "download",
                imageUrls: imageUrls
            },
            function(response) {
                if (response.numImages > 0) {
                    $("#status").text("画像: " + response.numImages + "枚");
                }
            });

        });

    });

})();
