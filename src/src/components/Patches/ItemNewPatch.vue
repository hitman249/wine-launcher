<template>
    <div class="item-point card-box m-b-10" @click="open">
        <div class="item-point__background"></div>

        <div class="table-box opport-box">
            <div class="table-detail">
                <div class="member-info text-center">
                    <h4><b>Создать новый патч</b> <i class="md md-add-circle-outline"></i></h4>
                </div>

            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name:       "ItemNewPatch",
        components: {},
        data() {
            return {
                config: null,
            };
        },
        methods:    {
            open() {

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