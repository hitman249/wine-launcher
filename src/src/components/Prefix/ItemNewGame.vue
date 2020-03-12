<template>
    <div class="new-game-item card-box m-b-10" @click="open">
        <div class="new-game-background"></div>

        <div class="table-box opport-box">
            <div class="table-detail">
                <div class="member-info text-center">
                    <h4><b>Добавить новую игру</b> <i class="md md-add-circle-outline"></i></h4>
                </div>

                <PopupEditConfig v-if="config" :config="config" ref="popup" :hide-button="true"/>
            </div>
        </div>
    </div>
</template>

<script>
    import PopupEditConfig from "./PopupEditConfig";
    import Config          from "../../modules/config";

    export default {
        name:       "ItemNewGame",
        components: {
            PopupEditConfig,
        },
        data() {
            return {
                config: null,
            };
        },
        methods:    {
            open() {
                this.config = new Config();
                this.$nextTick(() => {
                    this.$refs.popup.open();
                });
            },
        },
        computed:   {}
    }
</script>

<style lang="less">
    .new-game-background {
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
    }

    .new-game-item {
        transition: all 300ms ease-in-out;
        position: relative;
        cursor: pointer;

        h4 {
            transition: all 300ms ease-in-out;
        }

        &:hover {
            border: 2px solid #ffbd4a;
            color: #ffbd4a;

            h4 {
                color: #ffbd4a;
            }
            .new-game-background {
                opacity: 1;
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

    .md-add-circle-outline {
        font-size: 20px;
        margin-left: 5px;
    }
</style>