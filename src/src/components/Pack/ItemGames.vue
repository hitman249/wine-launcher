<template>
    <div class="item-point card-box m-b-10">
        <div class="item-point__background"></div>

        <div class="table-box opport-box">
            <div class="table-detail">
                <div class="member-info">
                    <h4><b>Games</b></h4>
                    <p class="text-dark">
                        Состояние:
                        <span v-if="item.mounted" class="label label-success">Упакован</span>
                        <span v-else class="label label-warning">Не упакован</span>
                    </p>
                </div>
            </div>

            <div class="table-detail item-point__info">
                <p v-if="item.size" class="text-dark">
                    <span class="label label-inverse">Размер: {{item.size_formatted}}</span>
                </p>
            </div>

            <div class="table-detail item-point__button-block">

            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name:       "ItemWine",
        props:      {
            item: Object,
        },
        components: {},
        methods:    {},
        computed:   {}
    }
</script>

<style lang="less" scoped>
    .item-point__info {
        text-align: center;
    }
</style>