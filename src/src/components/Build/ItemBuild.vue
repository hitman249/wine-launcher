<template>
    <div class="item-point card-box m-b-10" @mouseenter="hover">
        <div class="item-point__background"></div>

        <div class="table-box opport-box">
            <div class="table-detail">
                <div class="member-info">
                    <h4><b>Build</b></h4>
                    <p class="text-dark">
                        Состояние:
                        <span v-if="pack.wine.mounted" class="label label-success">Готов к сборке</span>
                        <span v-else class="label label-warning">Ожидание</span>
                    </p>
                </div>
            </div>

            <div class="table-detail item-point__info">
                <table class="text-dark text-muted tr-title">
                    <tbody>
                    <tr>
                        <td class="text-right">Wine</td>
                        <td>
                            <span v-if="pack.wine.mounted" class="label label-success">Упакован</span>
                            <span v-else class="label label-warning">Не упакован</span>
                        </td>
                    </tr>
                    <tr>
                        <td class="text-right">Games</td>
                        <td>
                            <span v-if="pack.games.mounted" class="label label-success">Упакован</span>
                            <span v-else class="label label-warning">Не упакован</span>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>

            <div class="table-detail item-point__button-block">
                <PopupBuild v-if="pack.wine.mounted"/>
            </div>
        </div>
    </div>
</template>

<script>
    import PopupBuild from "./PopupBuild";

    export default {
        name:       "ItemBuild",
        props:      {
            item: Object,
        },
        components: {
            PopupBuild,
        },
        data() {
            return {
                pack: this.$store.state.pack,
            };
        },
        methods:    {
            hover() {
                window.app.getAudioButton().hover();
            },
        },
        computed:   {},
    }
</script>

<style lang="less" scoped>
    .item-point__info {
        text-align: left;
    }

    .tr-title td {
        padding-right: 10px;
        padding-top: 2px;
        padding-bottom: 2px;
    }
</style>