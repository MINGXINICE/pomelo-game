module.exports = {
    double: {
        msgId: {
            request_enter: 101,
            response_playersInfo: 801,
            response_jump: 201,
            response_go: 202,
            response_exit: 802,
            response_Punish: 210,
            response_run: 105,
            response_Win: 153,
            response_Throw: 156,
            msgId_percent: 300,
            msgId_team: 400,
            msgId_connect: 199,
            msgId_webSocketClosed: 1001
        }
    },
    wuziqi: {
        RequestMsgId: {
            msgId_enter: 12,
            msgId_addPiece: 101,
            msgId_emoji: 102,
            msgId_readyGo: 103,
            msgId_retract: 105,
            msgId_draw: 106,
            msgId_giveup: 107,
            msgId_RetractEnsure: 108,
            msgId_drawEnsure: 109,
            msgId_test: 4
        }
        , ResponseMsgId: {
            msgId_playersInfo: 801,
            msgId_start: 205,
            msgId_addPiece: 206,
            msgId_emoji: 207,
            msgId_result: 208,
            msgId_go: 209,
            msgId_oneExit: 802,
            msgId_startRound: 211,
            msgId_retract: 212,
            msgId_draw: 213,
            msgId_drawEnsure: 214,
            msgId_giveup: 215,
            msgId_retractEnsure: 216,
            msgId_opReady: 217,
            msgId_test: 4
        }
        , MsgId: {
            msgId_loading: 1024,
            msgId_connect: 199,
            msgId_webSocketClosed: 1001
        }
    },
    ttq: {
        MsgId: {
            msgId_playersInfo: 801,
            msgId_exit: 802,
            msgId_heartbeat: 100,
            msgId_connect: 199,
            msgid_loading: 200,
            msgId_jump: 201,
            msgId_delay: 203,
            msgId_readyGo: 204,
            msgId_gameOver: 205,
            msgId_press: 206,
            msgId_catapult: 207,
            msgId_reset: 208,
            msgId_webSocketClosed: 1001,
            msgId_progress: 1002
        }
    },
    mfss: {
        MsgId: {
            msgId_playersInfo: 801, // 对方的资料
            msgId_exit: 802,        // 游戏断开
            msgId_jump: 201,
            msgId_readyGo: 204,     // 开始游戏
            msgId_gameOver: 205,   // 游戏结束
            msgId_balloon: 206,    // 打破气球
            msgId_percent: 200,     // 进度条
            msgId_webSocketClosed: 1001, // 网络协议关闭
            msgId_connect: 199,
        }
    },
    xzk: {
        MsgId: {
            msgId_playerInfo: 801,
            msgId_exit: 802,
            progress: 104,
            request_enter: 105,
            request_line: 106,
            request_lose: 114,
            response_start: 201,
            response_go: 205,
            response_line: 206,
            response_lose: 214,
            response_win: 215,
            msgId_webSocketClosed: 1001,
            msgId_connect: 1002
        }
    },
    bingqiu: {
        MsgId: {
            msgId_playersInfo: 801, // 对方的资料
            msgId_exit: 802,        // 游戏断开
            msgId_heartbeat: 100,
            msgId_connect: 199,
            msgid_loading: 200,     // 加载进度条
            msgId_jump: 201,        // jump
            msgId_delay: 203,
            msgId_readyGo: 204,
            msgId_gameOver: 205,   // onmessage: {\"win\":-1}
            msgId_move: 206,       // 移动圆盘
            msgId_strike: 207,   // 撞到球
            msgId_half: 208,
            msgId_goal: 209,
            msgId_currDelay: 210, // 双方没有撞到球，只是在空中或者撞墙壁
            msgId_round: 211,     // 赢球 只要有一方赢了三次就会 205
            msgId_webSocketClosed: 1001,
            msgId_progress: 1002
        }
    },


    gssc: {
        MsgId: {
            msgId_playersInfo: 801,
            msgId_exit: 802,
            msgId_connect: 199,
            msgId_jump: 201,
            msgId_readyGo: 204,
            msgId_gameOver: 205,
            msgId_progress: 200,
            msgId_direction: 206,
            msgId_boom: 207,
            msgId_pengzhuang: 208,
            msgId_xintiao: 100,
            msgId_webSocketClosed: 1001
        }
    },
    dmng: {
        MsgId: {
            msgId_playersInfo: 801,
            msgId_exit: 802,
            msgId_jump: 201,
            msgId_readyGo: 204,
            msgId_gameOver: 205,
            msgId_changeMap: 206,
            msgId_Hit: 207,
            msgId_myRoundOver: 208,
            msgId_RoundOver: 209,
            msgId_resetMap: 210,
            msgId_percent: 200,
            msgId_webSocketClosed: 1001,
            msgId_connect: 199
        }
    },

    dtxt: {
        MsgId: {
            msgId_playersInfo: 801, // 对手资料
            msgId_exit: 802,  // 退出
            msgId_xintiao: 100,
            msgId_connect: 199, // 链接
            msgId_jump: 201,
            msgId_readyGo: 204,
            msgId_gameOver: 205,
            msgId_speed: 206,  // 点击
            msgId_again: 207,  // 开始下一局（本局结束或者游戏结束）
            msgId_initdate: 208, // 初始化
            msgId_webSocketClosed: 1001,
            msgId_progress: 200  // 加载进度
        }
    },

    bang: {
        MsgId: {
            msgId_playersInfo: 801,
            msgId_exit: 802,
            msgId_connect: 199,
            msgId_jump: 201,
            msgId_readyGo: 204,
            msgId_progress: 200,
            msgId_gameOver: 205,
            msgId_shoot: 206,
            msgId_miss: 207,
            msgId_turn: 208,
            msgId_webSocketClosed: 1001,
            msgId_xintiao: 100
        }
    },
    yblb: {
        MsgId: {
            msgId_playersInfo: 801, // 对手资料
            msgId_exit: 802,        // 退出
            msgId_connect: 199,     // 链接
            msgId_jump: 201,
            msgId_readyGo: 204,     // 开始游戏
            msgId_gameOver: 205,    // 游戏结束
            msgId_step: 206,        // 跳步
            msgId_progress: 200,    // 进度条
            msgId_webSocketClosed: 1001 // webSocket关闭
        }
    },
    ffl: {
        MsgId: {
            msgId_playersInfo: 801,
            msgId_exit: 802,
            msgId_webSocketClosed: 1001,
            msgId_connect: 902,
            msgId_progress: 201,
            msgId_jump: 202,
            msgId_delay: 203,
            msgId_readyGo: 204,
            msgId_pair: 205,
            msgId_result: 206
        }
    },
    shuidi: {
        MsgId: {
            msgId_info: 801,
            msgId_progress: 200,
            msgId_exit: 802
        }

    }

}