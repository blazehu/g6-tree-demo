import G6 from '@antv/g6';


const k8sApiResources = {
    ComponentStatus: 'cs',
    ConfigMap: 'cm',
    Endpoints: 'ep',
    LimitRange: 'limits',
    Namespace: 'ns',
    PersistentVolumeClaim: 'pvc',
    PersistentVolume: 'pv',
    ReplicationController: 'rc',
    ResourceQuota: 'quota',
    ServiceAccount: 'sa',
    Service: 'svc',
    CustomResourceDefinition: 'crd',
    DaemonSet: 'ds',
    Deployment: 'deploy',
    ReplicaSet: 'rs',
    StatefulSet: 'sts',
    Application: 'app',
    ApplicationSet: 'appset',
    AppProject: 'appproj',
    HorizontalPodAutoscaler: 'hpa',
    CronJob: 'cj',
    CertificateSigningRequest: 'csr',
    LogConfig: 'lc',
    Ingress: 'ing',
    NetworkPolicy: 'netpol',
    PodDisruptionBudget: 'pdb',
    PodSecurityPolicy: 'psp',
    Pod: 'pod',
    PriorityClass: 'pc',
    StorageClass: 'sc',
    EndpointSlice: 'endpointslice',
    ControllerRevision: 'controllerrevision'
};

const SyncStatuses = {
    Unknown: 'Unknown',
    Synced: 'Synced',
    OutOfSync: 'OutOfSync',
};

const HealthStatuses = {
    Unknown: 'Unknown',
    Progressing: 'Progressing',
    Suspended: 'Suspended',
    Healthy: 'Healthy',
    Degraded: 'Degraded',
    Missing: 'Missing',
};

export const registerFlowLine = function () {
    G6.registerEdge('flow-line', {
        draw(cfg, group) {
            const {startPoint} = cfg;
            const {endPoint} = cfg;

            const {style} = cfg;
            return group.addShape('path', {
                attrs: {
                    stroke: style.stroke,
                    endArrow: style.endArrow,
                    path: [
                        ['M', startPoint.x, startPoint.y],
                        ['L', (startPoint.x + endPoint.x) / 2, startPoint.y],
                        ['L', (startPoint.x + endPoint.x) / 2, endPoint.y],
                        ['L', endPoint.x, endPoint.y],
                    ],
                },
            });
        },
    });
};

export const registerResourceNode = function () {
    G6.registerNode('resource', {
        // 自定义节点时的配置
        options: {
            size: [185, 70],
            style: {
                radius: 5,
                stroke: '#69c0ff',
                fill: '#ffffff',
                fillOpacity: 1,
            },
            // 文本样式配置
            labelCfg: {
                style: {
                    fill: '#595959',
                    fontSize: 14,
                },
                offset: 60, // 距离左侧的 offset
                offsetY: 28, // 距离上侧的 offset
            },
            preRect: {
                show: true,
                width: 4,
                fill: '#40a9ff',
                radius: 2,
            },
            // 节点中icon配置
            logoIcon: {
                // 是否显示icon，值为 false 则不渲染icon
                show: true,
                x: 0,
                y: 0,
                width: 32,
                height: 32,
                // 用于调整图标的左右位置
                offset: 0,
                // 用于调整图标的上下位置
                offsetY: -7,
                // 图标下面的文字描述
                title: '',
            },
            // 节点中表示同步状态的icon配置
            syncIcon: {
                // 是否显示icon，值为 false 则不渲染icon
                show: true,
                x: 0,
                y: 0,
                width: 18,
                height: 18,
                // 距离左侧的 offset
                offset: 96,
            },
            // 节点中表示健康状态的icon配置
            healthIcon: {
                // 是否显示icon，值为 false 则不渲染icon
                show: true,
                x: 0,
                y: 0,
                width: 18,
                height: 18,
                // 距离左侧的 offset
                offset: 72,
            },
            // 节点中表示状态的icon配置
            stateIcon: {
                // 是否显示icon，值为 false 则不渲染icon
                show: true,
                x: 0,
                y: 0,
                width: 16,
                height: 16,
                // 用于调整图标的左右位置
                offset: -5,
            },
            // 连接点，默认为左右
            // anchorPoints: [{ x: 0, y: 0.5 }, { x: 1, y: 0.5 }]
            anchorPoints: [
                [0, 0.5],
                [1, 0.5],
            ],
        },
        afterDraw: function drawShape(cfg, group) {
            const w = cfg.size[0];
            // set logoIcon
            if (cfg.kind !== 'Helm') {
                cfg.logoIcon = {
                    img: getResourceLogo(cfg.kind),
                    title: cfg.kind,
                };
            }
            const shape = group.addShape('text', {
                attrs: {
                    x: w / 2 - 60,
                    y: 20,
                    textBaseline: 'top',
                    lineHeight: 22,
                    fontSize: 13,
                    data: cfg?.info, // 这里不能展示数据，不然可能导致事件异常
                    fill: '#fff',
                    opacity: '0',
                },
                name: 'resource-info',
            });
            // draw
            this.drawLogoIcon(cfg, group);
            this.drawLabel(cfg, group);
            this.drawHealthIcon(cfg, group);
            this.drawSyncIcon(cfg, group);
            return shape;
        },
        /**
         * 绘制模型矩形左边的logo图标
         * @param {Object} cfg 数据配置项
         * @param {Object} group Group实例
         */
        drawLogoIcon(cfg, group) {
            const {logoIcon = {}} = this.getOptions(cfg);
            const size = this.getSize(cfg);
            const width = size[0];
            const height = size[1];

            if (logoIcon.show) {
                const {width: w, height: h, x, y, offset, offsetY, text, title, ...logoIconStyle} = logoIcon;
                if (text) {
                    group.addShape('text', {
                        attrs: {
                            x: 0,
                            y: 0,
                            fontSize: 12,
                            fill: '#000',
                            stroke: '#000',
                            textBaseline: 'middle',
                            textAlign: 'center',
                            cursor: 'pointer',
                            ...logoIconStyle,
                        },
                        className: 'rect-logo-icon',
                        name: 'rect-logo-icon',
                        draggable: true,
                    });
                } else {
                    group.addShape('image', {
                        attrs: {
                            ...logoIconStyle,
                            x: x || -width / 2 + (w) + (offset),
                            y: y || -(h) / 2 + offsetY,
                            width: w,
                            height: h,
                            cursor: 'pointer',
                        },
                        className: 'rect-logo-icon',
                        name: 'rect-logo-icon',
                        draggable: true,
                    });
                }
                if (title) {
                    const titleOffset = -offsetY;
                    let titleOffsetX = 0;
                    const shortName = getShortName(title);
                    if (shortName.length < 5) {
                        titleOffsetX = 7;
                    } else if (shortName.length < 9) {
                        titleOffsetX = -1;
                    } else {
                        titleOffsetX = -12;
                    }
                    group.addShape('text', {
                        attrs: {
                            x: x || -width / 2 + (w) + (offset) + (titleOffsetX),
                            y: y || height / 2 - (titleOffset),
                            text: shortName,
                            fontSize: 13,
                            fontWeight: 400,
                            fill: '#595959',
                            cursor: 'pointer',
                        },
                        name: 'rect-logo-title',
                    });
                }
                if (!logoIcon.img) {
                    group.addShape('circle', {
                        attrs: {
                            x: x || -width / 2 + (w) + 12,
                            y: y || -(h) / 2 + 8,
                            r: 18,
                            fill: '#8FA4B1',
                            cursor: 'pointer',
                        },
                        // must be assigned in G6 3.3 and later versions. it can be any value you want
                        name: 'circle-shape',
                    });
                    group.addShape('text', {
                        attrs: {
                            x: x || -width / 2 + (w) + 4,
                            y: y || -(h) / 2 + 2,
                            textBaseline: 'top',
                            lineHeight: 30,
                            fontSize: 13,
                            text: getLogoShortName(cfg.kind),
                            fill: '#FFF',
                            cursor: 'pointer',
                        },
                        name: 'custom-logo-title',
                    });
                }
            }
        },
        /**
         * 绘制模型矩形的label
         * @param {Object} cfg 数据配置项
         * @param {Object} group Group实例
         */
        drawLabel(cfg, group) {
            const {labelCfg = {}, logoIcon = {}} = this.getOptions(cfg);
            const size = this.getSize(cfg);
            const width = size[0];
            const height = size[1];

            let label = null;
            let offsetX = -width / 2 + labelCfg.offset;
            const {show, offsetY, width: w} = logoIcon;
            if (show) {
                offsetX = -width / 2 + (w) + labelCfg.offset;
            }
            const {style: fontStyle} = labelCfg;
            let y = 0;
            if (cfg?.health || cfg?.status) {
                y = -(height) / 2 + labelCfg.offsetY + offsetY + 7;
            } else {
                y = -(height) / 2 + labelCfg.offsetY + offsetY + 16;
            }
            label = group.addShape('text', {
                attrs: {
                    ...fontStyle,
                    x: offsetX,
                    y,
                    text: cfg.label,
                    cursor: 'pointer',
                },
                name: 'resource-name',
                draggable: true,
                labelRelated: true,
            });
            group.shapeMap['resource-name'] = label;
            return label;
        },
        /**
         * 绘制模型矩形的健康状态图标
         * @param {Object} cfg 数据配置项
         * @param {Object} group Group实例
         */
        drawHealthIcon(cfg, group) {
            const {healthIcon = {}, logoIcon = {}} = this.getOptions(cfg);
            const size = this.getSize(cfg);
            const width = size[0];

            if (healthIcon.show && cfg.health) {
                let offsetX = -width / 2 + healthIcon.offset;
                const {show, width: w} = healthIcon;
                if (show) {
                    offsetX = -width / 2 + (w) + healthIcon.offset;
                }
                const {offsetY} = logoIcon;
                const img = getHealthImg(cfg);
                group.addShape('image', {
                    attrs: {
                        x: offsetX,
                        y: -2 + offsetY + 7,
                        width: 18,
                        height: 18,
                        img,
                        cursor: 'pointer',
                    },
                    className: 'rect-health-icon',
                    name: 'rect-health-icon',
                });
            }
        },
        /**
         * 绘制模型矩形的同步状态图标
         * @param {Object} cfg 数据配置项
         * @param {Object} group Group实例
         */
        drawSyncIcon(cfg, group) {
            const {syncIcon = {}, healthIcon = {}, logoIcon = {}} = this.getOptions(cfg);
            const size = this.getSize(cfg);
            const width = size[0];

            if (syncIcon.show && cfg.status !== null) {
                let {offset} = syncIcon;
                if (!healthIcon.show || !cfg.health) {
                    offset = healthIcon.offset;
                }
                let offsetX = -width / 2 + offset;
                const {show, width: w} = syncIcon;
                if (show) {
                    offsetX = -width / 2 + (w) + offset;
                }
                const {offsetY} = logoIcon;
                const img = getSyncImg(cfg);
                group.addShape('image', {
                    attrs: {
                        x: offsetX,
                        y: -2 + offsetY + 7,
                        width: 18,
                        height: 18,
                        img,
                        cursor: 'pointer',
                    },
                    className: 'rect-sync-icon',
                    name: 'rect-sync-icon',
                });
            }
        },
    }, 'rect');
};

export const getEdgesLayer = function (edges) {
    const edgesLayer = {};
    edges.forEach((edge) => {
        if (edgesLayer[edge.source]) {
            edgesLayer[edge.source] = append(edgesLayer[edge.source], edge.target);
        } else {
            edgesLayer[edge.source] = [edge.target];
        }
    });
    const layer2 = (edgesLayer['0'] || []).length;
    let layer3 = 0;
    let layer4 = 0;
    (edgesLayer['0'] || []).forEach((v3) => {
        layer3 += (edgesLayer[v3] || []).length;
        (edgesLayer[v3] || []).forEach((v4) => {
            layer4 += (edgesLayer[v4] || []).length;
        });
    });
    return {
        'layer-1': 1,
        'layer-2': layer2,
        'layer-3': layer3,
        'layer-4': layer4,
    };
};

export const unique = function (a) {
    return [...new Set(a)];
};

export const append = function (a, v) {
    return unique([...a, v]);
};

export const getShortName = function (data) {
    return k8sApiResources[data];
};

export const getLogoShortName = function (data) {
    let newString = '';
    const stringArray = data.split('');
    stringArray.forEach((t) => {
        if (/[A-Z]/.test(t)) {
            newString = newString + t;
        }
    });
    return newString;
};

export const getResourceLogo = function (kind) {
    const ResourceIconMap = {
        Service: 'https://blazehu.com/images/k8s/kind/svc.svg',
        Endpoints: 'https://blazehu.com/images/k8s/kind/ep.svg',
        PersistentVolumeClaim: 'https://blazehu.com/images/k8s/kind/pvc.svg',
        Pod: 'https://blazehu.com/images/k8s/kind/pod.svg',
        ConfigMap: 'https://blazehu.com/images/k8s/kind/cm.svg',
        Deployment: 'https://blazehu.com/images/k8s/kind/deploy.svg',
        PersistentVolume: 'https://blazehu.com/images/k8s/kind/pv.svg',
        ReplicaSet: 'https://blazehu.com/images/k8s/kind/rs.svg',
        Secret: 'https://blazehu.com/images/k8s/kind/secret.svg',
        StatefulSet: 'https://blazehu.com/images/k8s/kind/sts.svg',
    };
    return ResourceIconMap[kind] ? ResourceIconMap[kind] : '';
};

export const getSyncImg = function (cfg) {
    let icon = null;
    switch (cfg?.status) {
        case SyncStatuses.Synced:
            icon = 'synced';
            break;
        case SyncStatuses.OutOfSync:
            icon = 'outofsync';
            break;
        case SyncStatuses.Unknown:
            icon = 'unknown';
            break;
    }
    return `https://blazehu.com/images/k8s/status/${icon}.svg`;
};

export const getHealthImg = function (cfg) {
    let icon = '';
    switch (cfg?.health) {
        case HealthStatuses.Healthy:
            icon = 'health';
            break;
        case HealthStatuses.Progressing:
            icon = 'progressing';
            // className = 'icon-spin';
            break;
        case HealthStatuses.Missing:
            icon = 'missing';
            break;
        case HealthStatuses.Degraded:
            icon = 'degraded';
            break;
        case HealthStatuses.Unknown:
            icon = 'unknown';
            break;
        case HealthStatuses.Suspended:
            icon = 'suspended';
            break;
    }
    return `https://blazehu.com/images/k8s/status/${icon}.svg`;
};
