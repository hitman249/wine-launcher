<template>
    <div class="item-point card-box m-b-10" @mouseenter="hover">
        <div class="item-point__background"></div>

        <div class="table-box opport-box">
            <div class="table-detail">
                <div class="member-info">
                    <h4><b>Wine</b></h4>
                    <p class="text-dark">
                        {{ $t('labels.state') }}:
                        <span v-if="item.mounted" class="label label-success">{{ $t('labels.packaged') }}</span>
                        <span v-else class="label label-warning">{{ $t('labels.not-packaged') }}</span>
                    </p>
                </div>
            </div>

            <div class="table-detail item-point__info">
                <p v-if="item.size" class="text-dark">
                    <span class="label label-inverse">{{ $t('labels.size') }}: {{item.size_formatted}}</span>
                </p>
            </div>

            <div class="table-detail item-point__button-block">
                <PopupWine v-if="item" :item="item"/>
            </div>
        </div>
    </div>
</template>

<script>
    import PopupWine from "./PopupWine";

    export default {
        name:       "ItemWine",
        props:      {
            item: Object,
        },
        components: {
            PopupWine,
        },
        methods:    {
            hover() {
                window.app.getAudioButton().hover();
            },
        },
        computed:   {}
    }
</script>

<style lang="less" scoped>
    .item-point__info {
        text-align: center;
    }
</style>