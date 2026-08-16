package vip.xiaonuo.zj.modular.viewing.service;

import com.baomidou.mybatisplus.extension.service.IService;
import vip.xiaonuo.zj.modular.viewing.entity.ZjViewingRequest;
import vip.xiaonuo.zj.modular.viewing.param.ZjViewingCreateParam;

import java.util.List;

public interface ZjViewingRequestService extends IService<ZjViewingRequest> {
    String create(ZjViewingCreateParam param);
    List<ZjViewingRequest> mine();
}
