<template>
    <div class="game-item card-box m-b-10">
        <div class="game-background">
            <img :src="config.background" alt="">
        </div>

        <div class="table-box opport-box">
            <div v-if="config.icon" class="table-detail game-icon">
                <img :src="config.icon" alt="img" class="thumb-lg m-r-15"/>
            </div>

            <div class="table-detail">
                <div class="member-info">
                    <h4 class="m-t-15"><b>{{config.name}}</b></h4>
                    <p v-if="config.description" class="text-dark">
                        <span class="text-muted">{{config.description}}</span>
                    </p>
                    <p v-if="config.version" class="text-dark">
                        <span class="text-muted">{{config.version}}</span>
                    </p>
                </div>
            </div>

            <div v-if="!edit" class="table-detail time-detail">
                <p class="text-dark m-b-5">
                    <b>Время в игре</b><br/>
                    <span class="label label-inverse">{{time}}</span>
                </p>
            </div>

            <div v-if="edit" class="table-detail game-info-block">
                <p class="text-dark m-b-5">
                    <span v-if="config.esync" class="label label-inverse m-r-5">esync</span>
                    <span v-if="config.pulse" class="label label-inverse m-r-5">pulse</span>
                    <span v-if="config.csmt" class="label label-inverse m-r-5">csmt</span>
                    <span v-if="config.window" class="label label-inverse m-r-5">window</span>
                </p>
            </div>

            <div class="table-detail block-play">
                <PopupPlay v-if="!edit" :config="config"/>
                <PopupEditConfig v-else :config="config"/>
            </div>
        </div>
    </div>
</template>

<script>
    import PopupPlay       from "./PopupPlay";
    import PopupEditConfig from "../Prefix/PopupEditConfig";
    import Time            from "../../helpers/time";

    export default {
        name:       "ItemGame",
        props:      {
            config: Object,
            edit:   Boolean,
        },
        components: {
            PopupPlay,
            PopupEditConfig,
        },
        computed:   {
            time() {
                return Time.secondPrint(this.config.time);
            },
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

    .game-item {
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

    .time-detail {
        text-align: left;
        width: 100px;
    }

    .game-info-block {
        overflow-wrap: break-word;
        word-break: break-word;
        padding-left: 20px;
        padding-right: 20px;
        text-align: right;
    }
</style>