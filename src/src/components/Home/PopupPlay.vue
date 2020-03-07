<template>
    <div>
        <button class="btn btn-play btn-custom waves-effect waves-light" @click="open" onclick="return false">
            <span>Играть</span> <i class="fa fa-angle-right m-l-10"></i>
        </button>

        <div :id="id" class="modal-demo">
            <button type="button" class="close" @click="cancel">
                <span>&times;</span><span class="sr-only">Close</span>
            </button>
            <h4 class="custom-modal-title">
                <span class="game-icon"><img :src="'local:/' + config.getGameIcon()" alt=""></span>
                {{config.getGameName()}}
            </h4>
            <div class="custom-modal-text text-left">
                <form role="form">

                    <div class="form-group m-b-30">
                        <label for="mode">Режим запуска</label>
                        <OnlySelect id="mode" :selected.sync="info.mode" :items="modes"/>
                    </div>

                    <div class="form-group text-center m-t-40">
                        <button type="button" class="btn btn-default waves-effect waves-light">Играть</button>
                        <button type="button" class="btn btn-danger waves-effect waves-light m-l-10" @click="cancel">Отмена</button>
                    </div>
                </form>
            </div>
        </div>

    </div>
</template>

<script>
    import action     from '../../store/action';
    import OnlySelect from "../UI/OnlySelect";
    import Collects   from "../../helpers/collects";

    export default {
        components: {
            OnlySelect,
        },
        name:       "PopupPlay",
        props:      {
            config: Object,
        },
        data() {
            return {
                id:    action.id,
                info:  {
                    mode: '',
                },
            };
        },
        methods:    {
            open() {
                let modal = new Custombox.modal({
                    content: {
                        effect: 'fadein',
                        target: `#${this.id}`,
                    }
                });

                modal.open();
            },
            save() {
                return Custombox.modal.close();
            },
            cancel() {
                return Custombox.modal.close();
            }
        },
        computed: {
            modes() {
                return Collects.getToSelect('modes');
            }
        }
    }
</script>

<style lang="less" scoped>
    .custom-modal-title {
        padding-left: 60px;
    }
    .game-icon {
        position: absolute;
        max-width: 36px;
        max-height: 36px;
        top: 8px;
        left: 8px;

        img {
            max-width: 100%;
            max-height: 100%;
        }
    }
    .modal-demo {
        width: 400px;
    }
    .custom-modal-text {
        position: relative;

        form {
            position: relative;
        }
    }
    .game-background {
        opacity: 1;
        border-radius: 0;
        background-position: center center;
        background-size: cover;
    }
</style>