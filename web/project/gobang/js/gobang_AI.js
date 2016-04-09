/**
 * Created by zhangzhao on 2016/4/6.
 */
'use strict';

//me是指棋子的角色，true为黑棋，其他为白棋
var me=true;
var chessBox=[]; //存放棋子状态，0，空棋子，1，黑棋，2，白棋
var wins=[];     //存放所有赢法
var myWin=[];    //存放玩家赢法，即黑棋第n种赢法情况下连成一条线的棋子个数
var computerWin=[]; //存放计算机赢法
var endClick=0;  //存放单击结束按钮的次数，在棋局没有完成的情况下，多次单击无效
var startClick=0;   //判断是否开始，如果没有开始，单击“结束”将不生效，开始时，设置为true，没有开始之前为false

var over=true;  //定义棋局是否结束，为true时表示结束
var chess= document.getElementById('gobang');
var context= chess.getContext('2d');
context.strokeStyle="#bfbfbf";
var count=0;


var beginChess=function() {
    startClick++;
    if(startClick > 1)
    {
        return null;
    }
    //如果玩家终止的棋局，在开始的时候，要将游戏还原成未开始状态
    //同时将玩家终止状态变为false
    if(over)
    {
        over=false;
    }

    initChessBox();
    initWins();
    allWinsBox();
    initWinScore();

    playerAI();
};

var endChess=function(flag) {
    endClick++;
    if(endClick > 1)
    {
        return null;
    }
    //结束要在棋局开始后点击才有效
    if(flag == 2 && startClick === 1)
    {
        alert("您终止了棋局！");
    }
    over=true;
    endClick=0;
    startClick=0;
    me=true;
    drawChessUI();
};
//为了防止在同一位置可以放两次棋子，将存储棋子在棋盘的状态，防止重复
//初始化棋子状态表chessBox
var initChessBox=function() {
    for(var i=0; i<15; i++)
    {
        chessBox[i]=[];
        for(var j=0; j<15; j++)
        {
            //0代表该处没有棋子
            chessBox[i][j]=0;
        }
    }
};


//初始化赢法列表wins
var initWins=function() {
    for(var i=0;i<15;i++)
    {
        wins[i]=[];
        for(var j=0;j<15;j++)
        {
            wins[i][j]=[];
        }
    }
};

//所有赢法的集合
var allWinsBox=function() {

    //所有竖向赢法的集合
    for(var i=0;i<15;i++)
    {
        //选择11是因为，此时最后一颗棋子已经到边缘
        for(var j=0;j<11;j++)
        {
            //选择5是因为，棋子是5颗一条线算赢
            for(var k=0;k<5;k++)
            {
                wins[i][j+k][count]=true;
            }
            count++;
        }
    }
    //所有横向赢法的集合
    for(i=0;i<15;i++)
    {
        for(j=0;j<11;j++)
        {
            for(k=0;k<5;k++)
            {
                wins[j+k][i][count]=true;
            }
            count++;
        }
    }

    //所有正斜线赢法
    for(i=0;i<11;i++)
    {
        for(j=0;j<11;j++)
        {
            for(k=0;k<5;k++)
            {
                wins[i+k][j+k][count]=true;
            }
            count++;
        }
    }

    //所有反斜线赢法
    for(i=0;i<11;i++)
    {
        for(j=14;j>3;j--)
        {
            for(k=0;k<5;k++)
            {
                wins[i+k][j-k][count]=true;
            }
            count++;
        }
    }
};


//初始化myWin和computerWin
var initWinScore=function() {
    for(var i=0;i<count;i++)
    {
        myWin[i]=0;
        computerWin[i]=0;
    }
};


//下面是绘制UI部分
var drawChessUI=function() {
    //背景图片
    var logo=new Image();
    logo.src = "image/background.jpg";

    //onload方法中调用图片,此时图片将会在绘制的表格上层
    logo.onload = function(){
        context.drawImage(logo,0,0,450,450);
        //因为加载图片比较慢，如果先绘制表格，后家族完图片，图片将会挡住表格
        //因此，需要先加载图片，再绘制表格（使用函数封装）
        drawChessBord();
    };

    //绘制棋盘表格
    var drawChessBord=function(){
        for(var i=0;i<15;i++)
        {
            //绘制棋盘横线，棋盘四周留白15px
            context.moveTo(15+i*30,15);
            context.lineTo(15+i*30,435);
            context.stroke();
            //棋盘的竖线
            context.moveTo(15,15+i*30);
            context.lineTo(435,15+i*30);
            //stroke用来描边，fill用来填充
            context.stroke();
        }
    };
};

//绘制棋子,i,j代表在棋盘的索引，me代表黑棋或白棋
var oneStep=function(i,j,me) {
    context.beginPath();
    //arc的参数：圆心的x,y坐标，半径13，弧度：0到2PI
    context.arc(15+i*30,15+j*30,13,0,2*Math.PI);
    context.closePath();
    //添加渐变效果，圆心坐标偏移2px，第二个园的半径为0
    var gradient=context.createRadialGradient(15+i*30+2,15+j*30-2,13,15+i*30+2,15+j*30-2,0);
    //黑棋
    if(me)
    {
        gradient.addColorStop(0,"#0a0a0a");
        gradient.addColorStop(1,"#636766");
    }
    //白棋
    else
    {
        gradient.addColorStop(0,"#d1d1d1");
        gradient.addColorStop(1,"#f9f9f9");
    }
    //填充棋子颜色
    context.fillStyle=gradient;
    context.fill();
};
//玩家走法
var playerAI=function() {
    chess.onclick=function(e) {
        //如果结束了，将直接返回
        if(over)
        {
            return;
        }
        //不是玩家下棋，直接return
        if(!me)
        {
            return;
        }
        //获取鼠标点击时的焦点坐标
        var x= e.offsetX;
        var y= e.offsetY;
        //计算索引
        var i=Math.floor(x/30);
        var j=Math.floor(y/30);
        //判断棋盘是否有空位，有空位才可以放置棋子
        if(chessBox[i][j] === 0)
        {
            oneStep(i,j,me);
            //走完之后，需设置状态为有棋子，1为黑棋，即玩家的棋子
            chessBox[i][j]=1;

            //遍历赢法数组，如果当前步骤可以赢，那么该位置处加1
            for(var k=0;k<count;k++)
            {
                if(wins[i][j][k])
                {
                    myWin[k]++;
                    //因为每种赢法只有5个子，一种棋子可以赢，那么另一种棋子在该步将可能赢。
                    //五子棋总共五颗子，不可能出现6颗一线的情况，因此可以设置为6，表示不能赢的情况
                    computerWin[k]=6;
                    //每一步判断是否赢了
                    if(myWin[k] === 5)
                    {
                        window.alert("恭喜，你赢了");
                        endChess(1);
                        break;
                    }
                }
            }
            if(!over)
            {
                me=!me;    //任一方走完，换计算机走
                computerAI();
            }
        }
    };
};


//计算机走法
var computerAI=function(){
    var myScore=[];       //使用二维数组，存放玩家得分
    var computerScore=[]; //使用二维数组，存放计算机得分
    var max=0;       //保存最高分数的坐标
    var u=0;              //保存最高分时的x坐标
    var v=0;              //保存最高分时的x坐标
    var i= 0;
    var j=0;
    var k=0;

    //如果结束了，将直接返回
    if(over)
    {
        return;
    }

    //初始化得分数组
    for(i=0; i<15; i++)
    {
        myScore[i]=[];
        computerScore[i]=[];
        for(j=0; j<15; j++)
        {
            myScore[i][j]=0;
            computerScore[i][j]=0;
        }
    }
    //遍历棋盘，找到空闲的点，然后遍历赢法数组，并进行加权计算，找出最优的点
    for(i=0; i<15; i++)
    {
        for(j=0; j<15; j++)
        {
            if(chessBox[i][j] == 0)
            {
                for(k=0;k<count;k++)
                {
                    if(wins[i][j][k])
                    {
                        //判断玩家棋子连接的个数，分别赋予不同的分数值
                        //同一直线的棋子越多，分数赋予的越高，越需要进行拦截
                        //i,j点有重复，分数会被累加
                        if(myWin[k] === 1)
                        {
                            myScore[i][j] += 10;
                        } else if(myWin[k] === 2)
                        {
                            myScore[i][j] += 40;
                        }
                        else if(myWin[k] === 3)
                        {
                            myScore[i][j] += 200;
                        } else if(myWin[k] === 4)
                        {
                            myScore[i][j] += 1000;
                        }

                        //同理，判断计算机在同一直线上的棋子数
                        if(computerWin[k] === 1)
                        {
                            computerScore[i][j] += 15;
                        } else if(computerWin[k] === 2)
                        {
                            computerScore[i][j] += 45;
                        }
                        else if(computerWin[k] === 3)
                        {
                            computerScore[i][j] += 205;
                        } else if(computerWin[k] === 4)
                        {
                            computerScore[i][j] += 1200;
                        }
                    }
                }
                //找出玩家最大分数来，并将最大分数的坐标值赋给u,v
                if(myScore[i][j] > max)
                {
                    max = myScore[i][j];
                    u = i;
                    v = j;
                } else if(myScore[i][j] === max)
                {
                    if(computerScore[i][j] > computerScore[u][v])
                    {
                        u = i;
                        v = j;
                    }
                }

                //找出计算机最大分数来，并将最大分数的坐标值赋给u,v
                if(computerScore[i][j] > max)
                {
                    max = myScore[i][j];
                    u = i;
                    v = j;
                } else if(computerScore[i][j] === max)
                {
                    if(myScore[i][j] > myScore[u][v])
                    {
                        u = i;
                        v = j;
                    }
                }
            }
        }

    }
    //白棋走
    oneStep(u,v,false);
    chessBox[u][v] = 2;
    for(k=0; k<count; k++)
    {
        if(wins[u][v][k])
        {
            computerWin[k]++;
            //因为每种赢法只有5个子，一种棋子可以赢，那么另一种棋子在该步将可能赢。
            //五子棋总共五颗子，不可能出现6颗一线的情况，因此可以设置为6，表示不能赢的情况
            myWin[k]=6;
            //每一步判断是否赢了
            if(computerWin[k] === 5)
            {
                window.alert("抱歉，计算机赢了，请再接再厉！");
                endChess(1);
                break;
            }
        }
    }
    if(!over)
    {
        me=!me;    //任一方走完，换计算机走
    }

};
