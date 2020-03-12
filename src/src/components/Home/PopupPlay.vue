<template>
    <div>
        <button class="btn item-point__button btn-custom"
                :class="{'waves-effect' : !config.launched, 'waves-light' : !config.launched}" @click="open"
                onclick="return false" :disabled="config.launched">
            <span>{{ config.launched ? 'Запущен' : 'Играть'}}</span>
            <i v-if="!config.launched" class="fa fa-angle-right m-l-10"></i>
        </button>

        <div :id="id" class="modal-demo">
            <button type="button" class="close" @click="cancel">
                <span>&times;</span><span class="sr-only">Close</span>
            </button>
            <h4 class="custom-modal-title">
                <span class="popup__icon"><img :src="config.icon" alt=""></span>
                {{config.name}}
            </h4>
            <div class="custom-modal-text text-left">
                <form role="form">
                    <template v-if="config.launched">
                        <div class="form-group m-b-30 text-center">
                            <h4 class="m-t-20"><b>Запускается...</b></h4>
                        </div>
                    </template>
                    <template v-else>
                        <div class="form-group m-b-30">
                            <label>Режим запуска</label>
                            <OnlySelect :selected.sync="mode" :items="modes"/>
                        </div>

                        <div class="form-group text-center m-t-40">
                            <button type="button" class="btn btn-default waves-effect waves-light" @click="save">
                                Играть
                            </button>
                            <button type="button" class="btn btn-danger waves-effect waves-light m-l-10"
                                    @click="cancel">
                                Отмена
                            </button>
                        </div>
                    </template>
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
                id:   action.id,
                info: this.$store.state.games.info,
                mode: 'standard',
            };
        },
        methods:    {
            open() {
                new Custombox.modal({
                    content: {
                        effect: 'fadein',
                        target: `#${this.id}`,
                    },
                    loader:  {
                        active: false,
                    },
                }).open();
            },
            save() {
                this.$store.dispatch(action.get('games').PLAY, { config: this.config, mode: this.mode });
            },
            cancel() {
                return Custombox.modal.close();
            },
        },
        computed:   {
            modes() {
                return Collects.getToSelect('modes');
            },
        }
    }
</script>

<style lang="less" scoped>
    .custom-modal-title {
        padding-left: 60px;
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
</style>