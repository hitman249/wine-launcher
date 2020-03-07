<template>
    <div class="card-box m-b-10">
        <div class="game-background">
            <img :src="'local:/' + config.getGameBackground()" alt="">
        </div>

        <div class="table-box opport-box">
            <div class="table-detail game-icon">
                <img :src="'local:/' + config.getGameIcon()" alt="img" class="thumb-lg m-r-15"/>
            </div>

            <div class="table-detail">
                <div class="member-info">
                    <h4 class="m-t-15"><b>{{config.getGameName()}}</b></h4>
                    <p v-if="config.getGameDescription()" class="text-dark">
                        <span class="text-muted">{{config.getGameDescription()}}</span>
                    </p>
                    <p v-if="config.getGameVersion()" class="text-dark">
                        <span class="text-muted">{{config.getGameVersion()}}</span>
                    </p>
                </div>
            </div>

            <div class="table-detail lable-detail">
                <p class="text-dark m-b-5">
                    <b>Время в игре: </b>
                    <span class="label label-inverse">0 мин.</span>
                </p>
            </div>

            <div class="table-detail table-actions-bar">
                <a href="#" class="table-action-btn"><i class="md md-edit"></i></a>
            </div>

            <div class="table-detail block-play">
                <PopupPlay :config="config"/>
            </div>
        </div>
    </div>
</template>

<script>
    import PopupPlay from "./PopupPlay";

    export default {
        name:       "GameItem",
        props:      {
            config: Object,
        },
        components: {
            PopupPlay,
        },
    }
</script>

<style lang="less">
    .game-icon {
        width: 115px;
    }

    .game-background {
        display: block;
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        opacity: 0;
        transition: opacity 300ms ease-in-out;
        z-index: 0;
        overflow: hidden;
        border-radius: 5px;

        &:after {
            display: block;
            position: absolute;
            width: 100%;
            height: 100%;
            content: '';
            background-color: #0b0b0b;
            opacity: 0.6;
            top: 0;
            left: 0;
        }

        img {
            display: block;
            position: absolute;
            pointer-events: none;
            width: calc(100% + 8px);
            top: 0;
            left: -4px;
            right: 0;
            bottom: 0;
            margin: auto;
        }
    }

    .btn-play {
        color: rgba(255, 255, 255, 0.6); // ffbd4a
        border: 1px solid rgba(255, 255, 255, 0.6);
        transition: all 300ms ease-in-out;

        &:hover {
            background-color: #ffaa17 !important;
        }

        i {
            font-size: 15px;
        }
    }

    .block-play {
        text-align: right;
        padding-right: 30px;
        width: 145px;
    }

    .card-box {
        transition: all 300ms ease-in-out;
        position: relative;

        &:hover {
            border: 2px solid #ffbd4a;

            .game-background {
                opacity: 1;
            }

            .btn-play {
                color: #ffbd4a;
                border: 1px solid #ffbd4a;
            }
        }
    }

    .table-box {
        position: relative;
    }

    .table-actions-bar {
        text-align: right;
    }
</style>