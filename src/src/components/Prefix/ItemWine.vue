<template>
    <div class="wine-item card-box m-b-10">
        <div class="wine-background"></div>

        <div class="table-box opport-box">
            <div class="table-detail">
                <div class="member-info">
                    <h4 class="m-t-15"><b>Wine</b></h4>
                    <p class="text-dark">
                        <span class="text-muted">{{status.wine_version}}</span>
                    </p>
                    <p class="text-dark">
                        <span class="text-muted"></span>
                    </p>
                </div>
            </div>

            <div class="table-detail wine-info-block">
                <p v-if="status.libs" class="text-dark m-b-10">
                    <span class="label label-inverse">Отсутствуют библиотеки:</span><br>
                    <code v-for="lib in status.libs" :key="lib" class="tag">{{lib}}</code>
                </p>
                <p v-if="status.wine_version !== status.prefix_version" class="text-dark m-b-5">
                    <span class="label label-inverse">Префикс не совместим с текущим Wine</span>
                </p>
            </div>

            <div class="table-detail block-play">
                <PopupWine/>
            </div>
        </div>
    </div>
</template>

<script>
    import PopupWine from "./PopupWine";
    import Collects  from "../../helpers/collects";

    export default {
        name:       "ItemWine",
        props:      {
            status: Object,
        },
        components: {
            PopupWine,
        },
        methods:    {
            getArch() {
                return Collects.arch[this.status.arch];
            },
        }
    }
</script>

<style lang="less">
    .wine-icon {
        width: 115px;
    }

    .wine-background {
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

    .wine-item {
        transition: all 300ms ease-in-out;
        position: relative;

        &:hover {
            border: 2px solid #ffbd4a;

            .wine-background {
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
        width: 40px;
    }

    .time-detail {
        text-align: left;
        width: 100px;
    }

    .tag {
        display: inline;
        white-space: nowrap;
        margin-right: 5px;
    }

    .wine-info-block {
        overflow-wrap: break-word;
        word-break: break-word;
        padding-left: 20px;
        padding-right: 20px;
    }
</style>