<template>
    <div class="item-point card-box m-b-10" @click="open" @mouseenter="hover">
        <div class="item-point__background"></div>

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
            hover() {
                window.app.getAudioButton().hover();
            },
        },
        computed:   {}
    }
</script>

<style lang="less" scoped>
    .item-point {
        cursor: pointer;

        h4 {
            transition: all 300ms ease-in-out;
        }

        &:hover {
            h4 {
                color: #ffbd4a;
            }
        }
    }

    .md-add-circle-outline {
        font-size: 20px;
        margin-left: 5px;
    }
</style>